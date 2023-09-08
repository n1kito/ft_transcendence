import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Put,
	Req,
	Res,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { SendMessageDTO } from './dto/sendMessage.dto';

@Controller('chat')
export class ChatController {
	constructor(
		private readonly chatService: ChatService,
		private readonly prisma: PrismaService,
	) {}

	// get isChannel, isPrivate, isProtected from chat
	@Get('/chatInfo/:chatId')
	async getChatInfo(
		@Req() request: CustomRequest,
		@Param('chatId') chatId: number,
	) {
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
	}

	// get messages from chat
	@Get('/chatMessages/:chatId')
	async getChatMessages(
		@Req() request: CustomRequest,
		@Param('chatId') chatId: number,
	) {
		const messages = await this.chatService.getChatMessages(request, chatId);
		return messages;
	}

	// TODO: Do I need to check the authentication here?
	@Put('/sendMessage')
	async sendMessage(
		@Body() sendMessage: SendMessageDTO,
		@Req() request: CustomRequest,
		// @Res() response: Response,
	) {
		try {

			console.log('🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱');
			console.log('request', request);
			const userId = this.chatService.authenticateUser(request);
			await this.chatService.sendMessage(userId, sendMessage);
			// response.status(HttpStatus.OK)
			// 	.json({ message: 'User updated successfully' });
		} catch (e) {
			console.error('error authenticating', e)
		}

	}
}
// const sortedMessages = messages.sort(
// 	(msgA, msgB) => msgA.sentAt.getDate() - msgB.sentAt.getDate(),
// );
// return sortedMessages;
