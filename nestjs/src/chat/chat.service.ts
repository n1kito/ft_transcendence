import {
	Get,
	HttpStatus,
	Injectable,
	NotFoundException,
	Param,
	Req,
	Res,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';
import { ValidationError, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CustomException } from 'src/user/user.service';
import { CreateChatDTO } from './dto/createChat.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { bufferCount } from 'rxjs';
import { connect } from 'http2';

@Injectable()
export class ChatService {
	private errors: { field: string; message: string; statusCode: number }[] = [];

	constructor(private readonly prisma: PrismaService) {}

	// true if the user is in the chat, false otherwise
	async isUserInChat(userId: number, chatId: number) {
		const response = await this.prisma.chat.findUnique({
			where: { id: chatId },
			select: { participants: true },
		});
		if (!response.participants) return false;
		for (const current of response.participants) {
			if (current.userId === userId) return true;
		}
		return false;
	}

	// get messages from chat
	async getChatMessages(
		@Req() request: CustomRequest,
		@Param('chatId') chatId: number,
	) {
		const nbChatId: number = +chatId;
		// if the userId is in the chat lets go
		const response = await this.prisma.chat.findUnique({
			where: {
				id: nbChatId,
			},
			include: {
				messages: true,
			},
		});
		const messages = response.messages.map((currentMessage) => ({
			id: currentMessage.id,
			sentById: currentMessage.userId,
			sentAt: currentMessage.sentAt,
			content: currentMessage.content,
			isNotif: currentMessage.isNotif,
			target: currentMessage.target,
			channelInvitation: currentMessage.channelInvitation,
			reply: currentMessage.reply,
		}));

		// get the login for each sender
		const messagesWithLoginPromises = messages.map(async (currentMessage) => {
			const res = await this.prisma.user.findUnique({
				where: {
					id: currentMessage.sentById,
				},
				select: {
					login: true,
					image: true,
				},
			});
			return res;
		});
		const messagesWithLoginRes = await Promise.all(messagesWithLoginPromises);

		// get the login of each target
		const targetLoginPromises = messages.map(async (currentMessage) => {
			if (!currentMessage.target) return;
			const res = await this.prisma.user.findUnique({
				where: {
					id: currentMessage.target,
				},
				select: {
					login: true,
				},
			});
			return res;
		});
		const targetLoginRes = await Promise.all(targetLoginPromises);

		// get messages and the array with the user together
		const messagesWithLogin = messages.map((currentMessage, index) => ({
			id: currentMessage.id,
			sentById: currentMessage.sentById,
			sentAt: currentMessage.sentAt,
			content: currentMessage.content,
			login: messagesWithLoginRes.at(index).login,
			avatar: messagesWithLoginRes.at(index).image,
			isNotif: currentMessage.isNotif,
			target: currentMessage.target,
			channelInvitation: currentMessage.channelInvitation,
			targetLogin: targetLoginRes.at(index)
				? targetLoginRes.at(index).login
				: null,
			reply: currentMessage.reply,
		}));
		return messagesWithLogin;
	}

	// create Chat
	async createChat(userId: number, content: CreateChatDTO) {
		if (content.password) {
			const salt = await bcrypt.genSalt();
			const hash = await bcrypt.hash(content.password, salt);
			const chat = await this.prisma.chat.create({
				data: {
					isChannel: content.isChannel,
					isPrivate: content.isPrivate,
					isProtected: content.isProtected,
					password: content.password ? hash : null,
					name: content.name,
				},
			});
			return chat.id;
		}
		const chat = await this.prisma.chat.create({
			data: {
				isChannel: content.isChannel,
				isPrivate: content.isPrivate,
				isProtected: content.isProtected,
				password: content.password,
				name: content.name,
			},
		});
		return chat.id;
	}

	// create chatSession
	async createChatSession(userId: number, chatId: number) {
		await this.prisma.chatSession.create({
			data: {
				chatId: chatId,
				userId: userId,
			},
		});
	}

	// send message
	async sendMessage(userId: number, content: SendMessageDTO) {
		await this.prisma.message.create({
			data: {
				chatId: content.chatId,
				userId: userId,
				content: content.message,
				isNotif: content.isNotif,
				target: content.targetId,
				channelInvitation: content.channelInvitation,
			},
		});
	}

	// leave channel: first delete the chat session, if the user was alone in
	// this convo, delete all the messages and then the chat
	async leaveChat(userId: number, chatId: number) {
		try {
			const wasOwner = await this.getAdminInfo(chatId, userId);
			this.prisma.chatSession
				.deleteMany({
					where: { chatId: chatId, userId: userId },
				})
				.then(async () => {
					this.getChannelRoom(chatId)
						.then((response) => {
							// if there was only 1 user, delete everything
							if (!response.participants || !response.participants.length) {
								this.prisma.message
									.deleteMany({
										where: {
											chatId: chatId,
										},
									})
									.then(() => {
										this.prisma.chat
											.delete({
												where: {
													id: chatId,
												},
											})
											.catch((e) => {});
									})
									.catch((e) => {});
							} else if (wasOwner.isOwner) {
								// if there was people remaining, put the first one to have joined as owner
								this.prisma.chatSession.update({
									where: { id: response.participants.at(0).id },
									data: {
										isOwner: true,
										isAdmin: true,
									},
								});
							}
						})
						.catch((e) => {});
				})
				.catch((e) => {});
		} catch (e) {}
	}

	/* ********************************************************************* */
	/* ***************************** CHANNELS ****************************** */
	/* ********************************************************************* */

	async setPrivacySettings(chatId: number, toPrivate: boolean) {
		try {
			await this.prisma.chat.update({
				where: {
					id: chatId,
				},
				data: {
					isPrivate: toPrivate,
				},
			});
		} catch (e) {}
	}

	async getRoom(chatId: number) {
		const res = await this.prisma.chat.findFirst({
			where: {
				id: chatId,
			},
			include: {
				participants: true,
			},
		});
		return res;
	}
	async getChannelRoom(chatId: number) {
		const res = await this.prisma.chat.findFirst({
			where: {
				id: chatId,
				isChannel: true,
			},
			include: {
				participants: true,
			},
		});
		return res;
	}

	async getChatByName(name: string) {
		const res = await this.prisma.chat.findFirst({
			where: { name: name },
			include: { participants: true },
		});
		return res;
	}

	async getAdminInfo(chatId: number, userId: number) {
		const res = await this.prisma.chatSession.findFirst({
			where: {
				chatId: chatId,
				userId: userId,
			},
			select: {
				isAdmin: true,
				isOwner: true,
			},
		});
		return res;
	}

	async makeAdmin(chatId: number, userId: number) {
		const res = await this.prisma.chatSession.updateMany({
			where: {
				chatId: chatId,
				userId: userId,
			},
			data: {
				isAdmin: true,
			},
		});
		return res;
	}

	async mute(chatId: number, userId: number) {
		const date = new Date();
		// adding 15minutes to the date
		date.setMinutes(date.getMinutes() + 15);
		const res = await this.prisma.chatSession.updateMany({
			where: {
				chatId: chatId,
				userId: userId,
			},
			data: {
				isMuted: date,
			},
		});
		return res;
	}

	async isUserMuted(chatId: number, userId: number) {
		const res = await this.prisma.chatSession.findFirst({
			where: {
				chatId: chatId,
				userId: userId,
			},
			select: {
				isMuted: true,
			},
		});
		const nowDate = new Date();
		if (res.isMuted > nowDate) return true;
		return false;
	}

	async ban(chatId: number, userId: number) {
		const res = await this.prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				bannedUsers: {
					connect: {
						id: userId,
					},
				},
			},
		});
		return res;
	}

	// return true if the user is banned
	async isUserBanned(chatId: number, userId: number) {
		const res = await this.prisma.chat.findUnique({
			where: { id: chatId },
			select: { bannedUsers: true },
		});
		for (const current of res.bannedUsers) {
			if (current.id === userId) return true;
		}
		return false;
	}

	// create a chat session for the creator of a channel
	async createOwnerChannelSession(userId: number, chatId: number) {
		await this.prisma.chatSession.create({
			data: {
				chatId: chatId,
				userId: userId,
				isOwner: true,
				isAdmin: true,
			},
		});
	}

	async setPassword(chatId: number, newPassword: string) {
		if (newPassword) {
			const salt = await bcrypt.genSalt();
			const hash = await bcrypt.hash(newPassword, salt);
			await this.prisma.chat.update({
				where: { id: chatId },
				data: {
					password: hash || null,
					isProtected: newPassword ? true : false,
				},
			});
		} else {
			await this.prisma.chat.update({
				where: { id: chatId },
				data: {
					password: null,
					isProtected: false,
				},
			});
		}
	}

	// returns true if there was no password or if it is the right password
	async checkPassword(chatId: number, password: string) {
		const response = await this.prisma.chat.findUnique({
			where: { id: chatId },
			select: {
				password: true,
				isProtected: true,
			},
		});
		if (!response.isProtected) return true;
		else {
			const isMatch = await bcrypt.compare(password, response.password);
			if (response.isProtected && isMatch) {
				return true;
			}
		}
		return false;
	}

	async sendNotification(
		userId: number,
		chatId: number,
		targetId: number,
		notificationType: string,
		channelName?: string,
	) {
		await this.prisma.message.create({
			data: {
				chatId: chatId,
				userId: userId,
				content: '',
				isNotif: notificationType,
				target: targetId,
				channelInvitation: channelName || null,
			},
		});
	}

	async invite(targetId: number, chatId: number) {
		const res = await this.prisma.chat.update({
			where: { id: chatId },
			data: {
				invitedUsers: {
					connect: {
						id: targetId,
					},
				},
			},
		});
		return res;
	}

	// true if the user is invited
	async isUserInvited(targetId: number, chatId: number) {
		const res = await this.prisma.chat.findFirst({
			where: { id: chatId },
			select: { invitedUsers: true },
		});
		for (const current of res.invitedUsers) {
			if (current.id === targetId) return true;
		}
		return false;
	}

	async deleteInvite(targetId: number, chatId: number) {
		const res = await this.prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				invitedUsers: {
					disconnect: {
						id: targetId,
					},
				},
			},
		});
		return res;
	}
	/* ********************************************************************* */
	/* ************************* PRIVATE MESSAGES ************************** */
	/* ********************************************************************* */

	async getPrivateMessageRoom(chatId: number) {
		const res = await this.prisma.chat.findFirst({
			where: {
				id: chatId,
				isChannel: false,
			},
			include: {
				participants: true,
			},
		});
		return res;
	}

	async findPrivateMessageByID(firstUserId: number, secondUserId: number) {
		const chatExists = await this.prisma.chat.findFirst({
			where: {
				AND: [
					{
						isChannel: false,
					},
					{
						participants: {
							some: {
								userId: firstUserId,
							},
						},
					},
					{
						participants: {
							some: {
								userId: secondUserId,
							},
						},
					},
				],
			},
		});
		return chatExists;
	}

	// true if the user received the message
	async checkRecipient(userId: number, chatId: number) {
		const isUserInChat = await this.isUserInChat(userId, chatId);
		if (!isUserInChat) return false;
		this.prisma.chat
			.findUnique({
				where: { id: chatId },
				select: {
					messages: true,
				},
			})
			.then(async (res) => {
				for (const message of res.messages) {
					if (
						message.isNotif &&
						message.isNotif === 'play' &&
						message.reply === null &&
						message.userId !== userId
					) {
						return true;
					}
				}
				return false;
			});
	}

	async replyToInvite(chatId: number, reply: boolean) {
		const res = await this.prisma.message.updateMany({
			where: { chatId: chatId, reply: null },
			data: {
				reply: reply,
			},
		});
	}
}
