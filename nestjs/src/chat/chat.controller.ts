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
			this.tokenService.ExtractUserId(request.headers['authorization']);
			const response = await this.prisma.chat.findUnique({
				where: {
					id: chatId,
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
			this.tokenService.ExtractUserId(request.headers['authorization']);
			if (!this.chatService.isUserInChat) {
				res.status(403);
				return;
			}
			const messages = await this.chatService.getChatMessages(request, chatId);
			return messages;
		} catch (e) {
			console.error('error fetching messages: ', e);
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
			let retChatId: number;
			if (createChat.name) {
				this.chatService
					.getChatByName(createChat.name)
					.then(async () => {
						this.chatService
							.createChat(userId, createChat)
							.then(async (chatId) => {
								console.log('🛑🛑🛑chatId🛑🛑🛑', chatId);
								await this.chatService.createChatSession(userId, chatId);
								retChatId = chatId;
								// return { chatId: chatId };
								response.status(200).json({ chatId: retChatId });
							});
					})
					.catch(() => {
						console.error('this chat already exists');
					});
			}
			// } else {
			// 	chatId = await this.chatService.createChat(userId, createChat);
			// }
			// const chatId = await this.chatService.createChat(userId, createChat);
			// // create both chat sessions
			// await this.chatService.createChatSession(userId, chatId);
			// if (createChat.userId)
			// 	await this.chatService.createChatSession(createChat.userId, chatId);
			// return { chatId: chatId };
		} catch (e) {
			console.error('error creating a private message: ', e);
			response.status(400);
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
			await this.chatService.sendMessage(userId, sendMessage);
			res.status(201).json({ message: 'Message sent successfully' });
		} catch (e) {
			console.error('error sending a message', e);
			res.status(404).json({ message: 'Could not send message' });
		}
	}

	@Delete('/leaveChannel')
	async leaveChannel(
		// @Body() leaveChannel: LeaveChannelDTO,
		@Body(new ValidationPipe()) leaveChannel: LeaveChannelDTO,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			await this.chatService.leaveChannel(userId, leaveChannel.chatId);
			response.status(200).json({ message: 'Channel left successfully' });
		} catch (e) {
			console.error('👋👋👋error leaving channel', e);
			response
				.status(400)
				.json({ message: 'Something went wrong leaving the channel' });
		}
	}

	// @Delete('/leavePM')
	// async leavePM(
	// 	@Body() leaveChannel: LeaveChannelDTO,
	// 	// @Body(new ValidationPipe()) leaveChannel: LeaveChannelDTO,
	// 	@Req() request: CustomRequest,
	// ) {
	// 	try {
	// 		const userId = this.tokenService.ExtractUserId(
	// 			request.headers['authorization'],
	// 		);
	// 		await this.chatService.leaveChannel(userId, leaveChannel.chatId);
	// 	} catch (e) {
	// 		console.error('👋👋👋error leaving channel', e);
	// 	}
	// }
}
