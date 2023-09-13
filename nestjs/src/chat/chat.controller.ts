import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Put,
	Req,
	Res,
	ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';
import { TokenService } from 'src/token/token.service';
import { CreateChatDTO } from './dto/createChat.dto';

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
	) {
		try {
			this.tokenService.ExtractUserId(request.headers['authorization']);
			const messages = await this.chatService.getChatMessages(request, chatId);
			return messages;
		} catch (e) {
			console.error('error fetching messages: ', e);
		}
	}

	@Put('/createChatPrivateMessage/:userId')
	async createChat(
		@Body(new ValidationPipe()) createChat: CreateChatDTO,
		@Req() request: CustomRequest,
	) {
		// TODO: should I check that this chat does not already exist?
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const chatId = await this.chatService.createChat(userId, createChat);
			// create both chat sessions
			await this.chatService.createChatSession(userId, chatId);
			await this.chatService.createChatSession(createChat.userId, chatId);
			return chatId;
		} catch (e) {
			console.error('error creating a private message: ', e);
		}
	}

	@Put('/sendMessage')
	async sendMessage(
		@Body(new ValidationPipe()) sendMessage: SendMessageDTO,
		@Req() request: CustomRequest,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			await this.chatService.sendMessage(userId, sendMessage);
		} catch (e) {
			console.error('error sending a message', e);
		}
	}
}

