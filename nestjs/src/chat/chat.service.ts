import {
	Get,
	HttpStatus,
	Injectable,
	NotFoundException,
	Param,
	Req,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';
import { ValidationError, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CustomException } from 'src/user/user.service';
import { CreateChatDTO } from './dto/createChat.dto';

@Injectable()
export class ChatService {
	private errors: { field: string; message: string; statusCode: number }[] = [];

	constructor(private readonly prisma: PrismaService) {}

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
		const chat = await this.prisma.chat.create({
			data: {
				isChannel: content.isChannel,
				isPrivate: content.isPrivate,
				isProtected: content.isProtected,
				password: content.password,
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
}
