import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Put,
	Req,
	Res,
	ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';
import { TokenService } from 'src/token/token.service';
import { CreateChatDTO } from './dto/createChat.dto';
import { LeaveChannelDTO } from './dto/leaveChannel.dto';
import { SetPrivateDTO } from './dto/setPrivate.dto';
import { SetPasswordDTO } from './dto/setPassword.dto';
import { ValidationError } from 'class-validator';
import { JoinChannelDTO } from './dto/joinChannel.dto';
import { errorMonitor } from 'events';
import { BlockUserDTO } from '../user/dto/blockUser.dto';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly tokenService: TokenService,
		private readonly prisma: PrismaService,
	) {}

	// get isChannel, isPrivate, isProtected from chat
	@Get('/chatInfo/:chatId')
	async getChatInfo(
		@Req() request: CustomRequest,
		@Param('chatId') chatId: number,
	) {
		try {
			const chatIdNb = +chatId;
			this.tokenService.ExtractUserId(request.headers['authorization'])
			const response = await this.prisma.chat.findUnique({
				where: {
					id: chatIdNb,
				},
			});
			return {
				isChannel: response.isChannel,
				isPrivate: response.isPrivate,
				isProtected: response.isProtected,
			};
		} catch (e) {
			console.error('error fetching chat info: ', e);
		}
	}

	// get messages from chat
	@Get('/chatMessages/:chatId')
	async getChatMessages(
		@Req() request: CustomRequest,
		@Param('chatId') chatId: number,
		@Res() res: Response,
	) {
		try {
			console.error('🛑🛑🛑', chatId);
			const nbChatId = +chatId
			const userId = this.tokenService.ExtractUserId(request.headers['authorization']);
			const isUserInChat = await this.chatService.isUserInChat(userId, nbChatId);
			if (!isUserInChat) {
				res.status(403).json({ message: 'You are not in this chat' });
				return;
			}
			const messages = await this.chatService.getChatMessages(request, nbChatId);
			res.status(200).json(messages);
		} catch (e) {
			console.error('error fetching messages: ', e);
			res.status(403).json({ message: 'Could not retreive messages' });
		}
	}

	// create a private message chat with the user and the targeted user
	@Put('/createChat/')
	async createChat(
		@Body(new ValidationPipe()) createChat: CreateChatDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		// TODO: should I check that this chat does not already exist?
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// if its a channel
			if (createChat.name) {
				this.chatService
					.getChatByName(createChat.name)
					.then(async (res) => {
						// if res, we found a chat named the same
						if (res) throw new Error('This chat already exists');
						this.chatService
							.createChat(userId, createChat)
							.then(async (chatId) => {
								console.log('🛑🛑🛑chatId🛑🛑🛑', chatId);
								await this.chatService.createOwnerChannelSession(
									userId,
									chatId,
								);
								response.status(200).json({ chatId: chatId });
							})
							.catch((e) => {
								throw new Error('Error creating the chat');
							});
					})
					.catch((e) => {
						response.status(401).json({ message: '' + e.message });
					});
				// if its a private message and the user does not already have a conv
			} else if (createChat.userId) {
				this.chatService.findPrivateMessageByID(createChat.userId, userId)
				.then((res) => {
					if (!res) {
						this.chatService.createChat(userId, createChat).then(async (chatId) => {
							await this.chatService.createChatSession(userId, chatId);
							await this.chatService.createChatSession(createChat.userId, chatId);
							response.status(200).json({ chatId: chatId });
						});
					} else {
						throw new Error('You already have a conversation with that person')
					}
				})
				.catch((e) => {
					response.status(401).json({ message: e.message });
				})
			} else {
				response.status(401).json({ message: 'Could not create chat' });
			}
		} catch (e) {
			console.error('error creating a private message: ', e);
			response.status(401).json({ message: e.message });
		}
	}

	@Put('/sendMessage')
	async sendMessage(
		@Body(new ValidationPipe()) sendMessage: SendMessageDTO,
		@Req() request: CustomRequest,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(userId, sendMessage.chatId);
			if (!isUserInChat) {
				res.status(403).json({ message: 'You are not in this chat' });
				return;
			}
			await this.chatService.sendMessage(userId, sendMessage);
			res.status(201).json({ message: 'Message sent successfully' });
		} catch (e) {
			console.error('error sending a message', e);
			res.status(400).json(e.message);
		}
	}


	@Delete('/leaveChat')
	async leaveChat(
		// @Body() leaveChannel: LeaveChannelDTO,
		@Body(new ValidationPipe()) leaveChannel: LeaveChannelDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(userId, leaveChannel.chatId);
			if (!isUserInChat) {
				response.status(403).json({ message: 'You are not in this chat' });
				return;
			}
			await this.chatService.leaveChat(userId, leaveChannel.chatId);
			response.status(200).json({ message: 'Channel left successfully' });
		} catch (e) {
			console.error('👋👋👋error leaving channel', e);
			response
				.status(400)
				.json({ message: 'Something went wrong leaving the channel' });
		}
	}


	/* ********************************************************************* */
	/* ***************************** CHANNELS ****************************** */
	/* ********************************************************************* */

	@Put('/joinChannel')
	async joinChannel(
		@Body(new ValidationPipe()) validatedData: JoinChannelDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.chatService
				.getChatByName(validatedData.name)
				.then(async (data) => {
					const isUserInChat = await this.chatService.isUserInChat(
						userId,
						data.id,
					);
					if (isUserInChat) {
						response
							.status(400)
							.json({ message: 'You are already in this chat' });
						return;
					}
					if (data.isPrivate)  {
						response
							.status(403)
							.json({ message: 'Could not join the channel' });
						return;
					}
					this.chatService
						.createChatSession(userId, data.id)
						.then(() => {
							response
								.status(200)
								.json({ chatId: data.id, participants: data.participants });
						})
						.catch((e) => {
							console.error('error joining a channel: ', e);
							response
								.status(400)
								.json({ message: 'Could not join the channel' });
						});
				})
				.catch(() => {
					response.status(404).json({ message: 'Could not find channel' });
				});
		} catch (e) {
			response.status(401).json({ message: e.message });
		}
	}

	@Put('/setPrivate')
	async setPrivate(
		@Body(new ValidationPipe()) setPrivate: SetPrivateDTO,
		@Req() request: CustomRequest,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const isUserInChat = await this.chatService.isUserInChat(
				userId,
				setPrivate.chatId,
			);
			if (!isUserInChat) {
				res.status(403).json({ message: 'You are not in this chat' });
				return;
			}
			this.chatService.getAdminInfo(setPrivate.chatId, userId).then((data) => {
				if (data.isAdmin || data.isOwner) {
					this.chatService
						.setPrivacySettings(setPrivate.chatId, setPrivate.toPrivate)
						.then(() => {
							res.status(200).json({
								message: 'switched chat privacy settings successfully',
							});
						});
				} else {
					res
						.status(403)
						.json({ message: "You don't have sufficient admin rights" });
				}
			});
		} catch (e) {
			console.error('👋👋👋👋👋👋👋👋👋👋👋👋set private error: ', e);
			res.status(401).json({ message: e.message });
		}
	}

	@Get('/getOwnAdminInfo/:chatId')
	async getOwnAdminInfo(
		@Req() request: CustomRequest,
		@Res() res: Response,
		@Param('chatId') chatId: number,
	) {
		try {
			const nbChatId: number = +chatId;
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.chatService
				.getAdminInfo(nbChatId, userId)
				.then((data) => {
					res
						.status(200)
						.json({ isAdmin: data.isAdmin, isOwner: data.isOwner });
				})
				.catch((e) => {
					throw new Error('Could not find your session');
				});
		} catch (e) {
			res.status(401).json({ message: e.message });
		}
	}

	@Put('/setPassword')
	async setPassword(
		@Req() request: CustomRequest,
		@Body(new ValidationPipe()) validatedData: SetPasswordDTO,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.chatService
				.getAdminInfo(validatedData.chatId, userId)
				.then((data) => {
					if (data.isAdmin || data.isOwner) {
						this.chatService
							.setPassword(validatedData.chatId, validatedData.newPassword)
							.then(() => {
								response.status(200).json({
									message: 'changed password successfully',
								});
							});
					} else {
						response
							.status(403)
							.json({ message: "You don't have sufficient admin rights" });
					}
				});
		} catch (e) {
			response.status(401).json({ message: e.message });
		}
	}
}
