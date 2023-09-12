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

	// method to push any encountered error
	private pushError(field: string, message: string, statusCode: number) {
		this.errors.push({ field, message, statusCode });
	}

	// check if the user is authenticated or not. request parameter is expected to contain the
	// property `userId`. If found, return the user id, else throw a NotFoundException
	authenticateUser(request: CustomRequest): number {
		const userId = request.userId;
		if (!userId) {
			throw new NotFoundException('Authentication required');
		}
		return userId;
	}

	// Message DTO validation
	async validateSendMessageDto(sendMessageDTO: SendMessageDTO): Promise<void> {
		// converts the plain js object sendMessageDTO into an instance of the 'SendMessageDTO class'
		// Any dto errors are stored in classValidatorErrors
		const classValidatorErrors: ValidationError[] = await validate(
			plainToClass(SendMessageDTO, sendMessageDTO),
		);
		// if classValidators is not empty
		if (classValidatorErrors.length > 0) {
			// iterates over each error
			for (const error of classValidatorErrors) {
				// add the dto error into the 'errors' property
				for (const constraintKey of Object.keys(error.constraints)) {
					this.pushError(
						error.property,
						error.constraints[constraintKey],
						HttpStatus.BAD_REQUEST,
					);
				}
			}
		}
	}

	// Chat DTO validation
	async validateCreateChatDto(createMessage: CreateChatDTO): Promise<void> {
		// converts the plain js object createMessage into an instance of the 'CreateChatDTO class'
		// Any dto errors are stored in classValidatorErrors
		const classValidatorErrors: ValidationError[] = await validate(
			plainToClass(CreateChatDTO, createMessage),
		);
		// if classValidators is not empty
		if (classValidatorErrors.length > 0) {
			// iterates over each error
			for (const error of classValidatorErrors) {
				// add the dto error into the 'errors' property
				for (const constraintKey of Object.keys(error.constraints)) {
					this.pushError(
						error.property,
						error.constraints[constraintKey],
						HttpStatus.BAD_REQUEST,
					);
				}
			}
		}
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
		this.errors = [];
		try {
			const chat = await this.prisma.chat.create({
				data: {
					isChannel: content.isChannel,
					isPrivate: content.isPrivate,
					isProtected: content.isProtected,
					password: content.password,
				},
			});
			// if (this.errors.length > 0) {
			//     throw new Exce(this.errors);
			// }
			return chat.id;
		} catch (e) {
			console.log('error creating chat:', e);
			// throw new CustomException(this.errors);
		}
	}

	// create chatSession
	async createChatSession(userId: number, chatId: number) {
		await this.prisma.chatSession.create({
			data: {
				chatId: chatId,
				userId: userId,
			},
		});
		console.log('🐱🐱🐱🐱🐱🐱🐱🐱');
	}

	// send message
	async sendMessage(userId: number, content: SendMessageDTO) {
		this.errors = [];
		try {
			console.log('content.message before validation', content.message);
			await this.validateSendMessageDto(content);
			console.log('content.message after validation', content.message);
			await this.prisma.message.create({
				data: {
					chatId: content.chatId,
					userId: userId,
					content: content.message,
				},
			});
			// if (this.errors.length > 0) {
			//     throw new Exce(this.errors);
			// }
		} catch (e) {
			console.log('error sending message:', e);
			// throw new CustomException(this.errors);
		}
	}
}
