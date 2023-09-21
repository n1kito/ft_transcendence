import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	NotFoundException,
	Param,
	Put,
	Req,
	Res,
	ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { Request, response, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { validate } from 'class-validator';
import { get } from 'http';
import { ChatService } from 'src/chat/chat.service';
import { pairwise } from 'rxjs';
import { BlockUserDTO } from './dto/blockUser.dto';
import { TokenService } from 'src/token/token.service';
export interface CustomRequest extends Request {
	userId: number;
}

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
		private readonly chatService: ChatService,
		private readonly tokenService: TokenService,
	) {}

	@Get('me')
	async getMyinfo(@Req() request: CustomRequest) {
		const userId = this.userService.authenticateUser(request);

		// Fetch the user information from the database using the userId
		const user = await this.prisma.user.findUnique({
			where: { id: request.userId },
			include: {
				gamesPlayed: true,
				target: true,
				friends: true,
			}, // Include the gamesPlayed relation
		});

		// Handle case when user is not found
		if (!user) {
			return { message: 'User not found' };
		}

		// Get user games count
		const gamesCount = user.gamesPlayed.length;
		// await this.prisma.game.count({
		// 	where: {
		// 		OR: [{ player1Id: user.id }, { player2Id: user.id }],
		// 	},
		// });

		// Bestie logic
		const bestieUser = await this.userService.findUserBestie(user.id);

		// Target logic
		const targetLogin = user?.target?.login;
		const targetImage = user?.target?.image;
		// Rival logic
		const { rivalLogin, rivalImage } = await this.userService.findUserRival(
			user.id,
		);

		// get user's rank
		const usersWithHigherKillCountThanOurUser = await this.prisma.user.count({
			where: {
				killCount: {
					gt: await this.prisma.user
						.findUnique({
							where: { id: user.id },
							select: { killCount: true },
						})
						.then((user) => user?.killCount || 0),
				},
			},
		});
		const userRank = usersWithHigherKillCountThanOurUser + 1;

		// Return the user information
		return {
			id: user.id,
			login: user.login,
			email: user.email,
			image: user.image,
			friends: user.friends,
			// ...user,
			targetLogin,
			targetImage,
			gamesCount,
			bestieLogin: bestieUser.bestieLogin,
			bestieImage: bestieUser.bestieImage,
			rivalLogin,
			rivalImage,
			killCount: user.killCount,
			winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
			rank: userRank,
			// chat
			// ownedChannels: user.ownedChannels,
		};
	}

	@Put('me/update')
	async updateMyUser(
		@Body() updateUserDto: UpdateUserDto,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		const userId = this.userService.authenticateUser(request);

		await this.userService.updateUser(userId, updateUserDto);
		response
			.status(HttpStatus.OK)
			.json({ message: 'User updated successfully' });
	}

	@Put('me/updateTargetStatus')
	async updateTargetStatus(
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			console.log('\n🞋 UPDATING TARGET STATUS 🞋\n');
			const userId = this.userService.authenticateUser(request);
			const user = await this.prisma.user.update({
				where: { id: userId },
				data: { targetDiscoveredByUser: true },
			});
			response
				.status(200)
				.json({ message: 'Target status updated successfully' });
		} catch (error) {
			response
				.status(500)
				.json({ error: 'Could not update target discovery status.' });
		}
	}

	// TODO: change route to user/me/friends or something, I just created a separate one to avoid with the /user/me routes Jee created
	// TODO: move the logic to the service file
	@Get('friends')
	async getUserFriends(@Req() request: CustomRequest) {
		// Retrieve the entry corresponding to the user requesting those changes
		const userRequesting = await this.prisma.user.findUnique({
			where: { id: request.userId },
			include: {
				friends: true,
			},
		});
		// TODO: select more fields
		// Only select some fields for each friend
		const friends = userRequesting.friends.map((currentFriend) => ({
			id: currentFriend.id,
			login: currentFriend.login,
			image: currentFriend.image,
			onlineStatus: currentFriend.onlineStatus,
		}));
		return friends;
	}

	// TODO: why do we have this and the /me endpoint ?
	// TODO: switch this endpoint to userID
	// TODO: move the logics to user.service.ts ?
	// TODO: Is this correctly authenticated ?
	@Get(':login')
	async getUserInfo(
		@Param('login') login: string,
		@Req() request: CustomRequest,
	) {
		const user = await this.prisma.user.findUnique({
			where: { login },
			include: { gamesPlayed: true },
		});
		if (!user) {
			// Handle case when user is not found
			return { message: 'User not found' };
		}
		// identify the login associated with the ID the request is coming from
		const userRequesting = await this.prisma.user.findUnique({
			where: { id: request.userId },
		});
		const userRequestingLogin = userRequesting?.login;
		// get how many games the player has played by counting the games where user
		// was user player1 or player2
		const gamesCount = user.gamesPlayed.length;
		// get user's rank
		const usersWithHigherKillCountThanOurUser = await this.prisma.user.count({
			where: {
				killCount: {
					gt: await this.prisma.user
						.findUnique({
							where: { id: user.id },
							select: { killCount: true },
						})
						.then((user) => user?.killCount || 0),
				},
			},
		});
		// Bestie logic
		const bestieUser = await this.userService.findUserBestie(user.id);
		// Rank logic
		const userRank = usersWithHigherKillCountThanOurUser + 1;
		// Target logic
		const targetUser = await this.prisma.user.findUnique({
			where: { id: user.targetId },
		});
		// Rival logic
		const { rivalLogin, rivalImage } = await this.userService.findUserRival(
			user.id,
		);
		// Match history logic
		let matchHistory;
		try {
			matchHistory = await this.userService.getUserMatchHistory(user.id);
		} catch (error) {
			console.log('Error retrieving match history: ', error);
		}
		// if the login of the user who sent the request is the same as the login of the user they want the info of,
		// we return more information
		if (userRequestingLogin && userRequestingLogin === login)
			return {
				...user,
				gamesCount: gamesCount,
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				rank: userRank,
				targetLogin: targetUser.login,
				targetImage: targetUser.image,
				bestieLogin: bestieUser.bestieLogin,
				bestieImage: bestieUser.bestieImage,
				matchHistory: matchHistory,
				rivalLogin,
				rivalImage,
			};
		// else, we only return what is needed for the profile component
		else
			return {
				login: user.login,
				image: user.image,
				// add profile information
				gamesCount: gamesCount,
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				rank: userRank,
				targetLogin: targetUser.login,
				targetImage: targetUser.image,
				targetDiscoveredByUser: user.targetDiscoveredByUser,
				bestieLogin: bestieUser.bestieLogin,
				bestieImage: bestieUser.bestieImage,
				matchHistory: matchHistory,
				rivalLogin,
				rivalImage,
			};
	}

	// Get public data from userId
	// TODO: DTO for userID ?
	@Get('/byId/:userId')
	async getPublicDataFromUserId(
		@Req() request: CustomRequest,
		@Param('userId') userId: number,
	) {
		// be sure the userId is a number
		let userIdToNb: number = +userId;
		const response = await this.userService.getPublicDataFromUserId(userIdToNb);
		if (!response) return { message: 'User not found' };
		const ret = { login: response.login, image: response.image };
		console.log('ret', ret);
		return ret;
	}

	// Get userId from login
	// TODO: DTO for login ?
	@Get('/byLogin/:login')
	async getUserIdFromLogin(
		@Req() request: CustomRequest,
		@Param('login') login: string,
	) {
		// be sure the userId is a number
		const response = await this.prisma.user.findUnique({
			where: { login: login },
			select: {
				id: true,
			},
		});
		if (!response) return { message: 'User not found' };
		const ret = { id: response.id };
		return ret;
	}

	// Chat logic
	// Private messages
	@Get('me/privateMessages')
	async getPrivateMessages(
		@Req() request: CustomRequest,
		@Param('userId') userId: number,
		@Res() res: Response,
	) {
		try {
			// this contains an array of the chat sessions
			const chatSessions = await this.userService.getChatSessions(
				request.userId,
			);

			// this contains an array of the chat rooms joined that are not channels
			const chatPromises = chatSessions.map(async (currentChat) => {
				const room = await this.chatService.getPrivateMessageRoom(
					currentChat.chatId,
				);
				return room; // Return the result of each asynchronous operation
			});
			// the filter(Boolean) throws away every null/undefined object
			const chatRoomsResults = await Promise.all(chatPromises);
			const chatRoomsFiltered = chatRoomsResults.filter(Boolean);

			// this contains for each room joined, the id of the room, the participants,
			// the name of the other user and its image
			const rooms = await Promise.all(
				chatRoomsFiltered.map(async (currentRoom) => {
					let name: string;
					let avatar: string;
					await Promise.all(
						currentRoom.participants.map(async (currentParticipant) => {
							if (currentParticipant.userId !== request.userId) {
								const participantData =
									await this.userService.getPublicDataFromUserId(
										currentParticipant.userId,
									);
								name = participantData.login;
								avatar = participantData.image;
							}
						}),
					);

					return {
						chatId: currentRoom.id,
						participants: currentRoom.participants.map((currentParticipant) => {
							return currentParticipant.userId;
						}),
						name: name,
						avatar: avatar,
						isChannel: false,
					};
				}),
			);
			console.log('rooms', rooms);
			res.status(200).json(rooms);
			// return rooms;
		} catch (e) {
			res.status(401).json({ message: 'Could not fetch private messages' });
			console.error('Could not retreive private messages: ', e);
		}
	}

	// get channels
	@Get('me/channels')
	async getChannels(
		@Req() request: CustomRequest,
		@Param('userId') userId: number,
	) {
		try {
			// this contains an array of the chat sessions
			const chatSessions = await this.userService.getChatSessions(
				request.userId,
			);

			// this contains an array of the chat rooms joined that are channels
			const chatPromises = chatSessions.map(async (currentChat) => {
				const room = await this.chatService.getChannelRoom(currentChat.chatId);
				return room; // Return the result of each asynchronous operation
			});
			// the filter(Boolean) throws away every null/undefined object
			const chatRoomsResults = await Promise.all(chatPromises);
			const chatRoomsFiltered = chatRoomsResults.filter(Boolean);

			// this contains for each room joined, the id of the room, the participants,
			// the name of the channel
			const rooms = await Promise.all(
				chatRoomsFiltered.map(async (currentRoom) => {
					return {
						chatId: currentRoom.id,
						participants: currentRoom.participants.map((currentParticipant) => {
							return currentParticipant.userId;
						}),
						name: currentRoom.name,
						isChannel: true,
					};
				}),
			);
			console.log('rooms', rooms);
			return rooms;
		} catch (e) {
			console.error('Could not fetch channels: ', e);
		}
	}

	// get messages from chat
	@Get('/chatMessages/:chatId')
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
		}));
		return messages;
	}

	@Put('/blockUser')
	async blockUser(
		@Body(new ValidationPipe()) validatedData: BlockUserDTO,
		@Req() request: CustomRequest,
		@Res() res: Response,
	) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.prisma
				.findUserById(validatedData.userId)
				.then(() => {
					this.userService
						.blockUser(userId, validatedData.userId)
						.then(() => {
							res.status(200).json({ message: 'User blocked successfully' });
						})
						.catch((e) => {
							throw new Error('could not block user: ' + e.message);
						});
				})
				.catch(() => {
					res.status(404).json({ message: 'Could not find user to block' });
					throw new Error('Could find user to block');
				});
		} catch (e) {
			console.error('error blocking a user', e.message);
			res.status(400).json(e.message);
		}
	}
}
