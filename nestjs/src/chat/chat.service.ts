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
			sentById: currentMessage.userId,
			sentAt: currentMessage.sentAt,
			content: currentMessage.content,
			// sentByLogin: currentMessage.
		}));

		// get the login for each sender
		// TODO: Here I think I am fetching everyhting from user, I should only fetch login
		const messagesWithLoginPromises = messages.map(async (currentMessage) => {
			const res = await this.prisma.user.findUnique({
				where: {
					id: currentMessage.sentById,
				},
			});
			return res;
		});
		const messagesWithLoginRes = await Promise.all(messagesWithLoginPromises);

		// get messages and the array with the user together
		const messagesWithLogin = messages.map((currentMessage, index) => ({
			sentById: currentMessage.sentById,
			sentAt: currentMessage.sentAt,
			content: currentMessage.content,
			login: messagesWithLoginRes.at(index).login,
			avatar: messagesWithLoginRes.at(index).image,
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
			},
		});
	}

	// leave channel: first delete the chat session, if the user was alone in
	// this convo, delete all the messages and then the chat
	async leaveChat(userId: number, chatId: number) {
		try {
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
											.catch((e) => {
												console.error('Could not delete chat: ', e);
											});
									})
									.catch((e) => {
										console.error('Could not delete messages: ', e);
									});
							} else {
								console.log(
									'👋👋👋👋👋👋response.participants.at(0) : ',
									response.participants.at(0),
								);
								// if there was people remaining, put the first one to have joined as owner
								this.prisma.chatSession
									.update({
										where: { id: response.participants.at(0).id },
										data: {
											isOwner: true,
											isAdmin: true,
										},
									})
									.then((data) => {
										console.log('data', data);
									});
							}
						})
						.catch((e) => {
							console.error('Error getting the channel room');
						});
				})
				.catch((e) => {
					console.error('something went wrong when deleting the channel');
				});
		} catch (e) {
			console.error('could not leave channel: ', e);
		}
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
		} catch (e) {
			console.error('Could not set chat privacy settings');
		}
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
		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(newPassword, salt);
		await this.prisma.chat.update({
			where: { id: chatId },
			data: {
				password: hash || null,
				isProtected: newPassword ? true : false,
			},
		});
	}

	// returns true if there was no password or if it is the right password
	// TODO: password hash
	async checkPassword(chatId: number, password: string) {
		const response = await this.prisma.chat.findUnique({
			where: { id: chatId },
			select: {
				password: true,
				isProtected: true,
			},
		});
		const isMatch = await bcrypt.compare(password, response.password);
		if (!response.isProtected || (response.isProtected && isMatch)) {
			return true;
		}
		return false;
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
}
