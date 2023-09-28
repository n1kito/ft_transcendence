import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpException,
	HttpStatus,
	MaxFileSizeValidator,
	NotFoundException,
	Param,
	ParseFilePipe,
	Put,
	Req,
	Res,
	Search,
	StreamableFile,
	UnauthorizedException,
	UploadedFile,
	UseInterceptors,
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
import { twoFactorAuthenticationCodeDto } from 'src/auth/dto/two-factor-auth-code.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';
import path from 'path';

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

	@Put('me/update')
	async updateMyUser(
		@Body() updateUser: UpdateUserDto,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		const userId = this.userService.authenticateUser(request);

		await this.userService.updateUser(userId, updateUser);
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

	@Delete('me/delete')
	async deleteSelf(@Req() request: CustomRequest, @Res() response: Response) {
		try {
			const userId = this.userService.authenticateUser(request);
			await this.userService.deleteUser(userId);
			response
				.status(200)
				.json({ message: 'User account deleted successfully' });
		} catch (error) {
			return response.status(500).json({
				error: 'Could not delete user account',
			});
		}
	}

	// TODO: change route to user/me/friends or something, I just created a separate one to avoid with the /user/me routes Jee created
	// TODO: move the logic to the service file
	@Get('friends')
	async getUserFriends(
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		// Retrieve the entry corresponding to the user requesting those changes
		const userRequesting = await this.prisma.user.findUnique({
			where: { id: request.userId },
			include: {
				friends: true,
			},
		});
		if (!userRequesting)
			return response.status(401).json({ message: 'unauthorized request' });
		// TODO: select more fields
		// Only select some fields for each friend
		try {
			const friends = userRequesting.friends.map((currentFriend) => ({
				id: currentFriend.id,
				login: currentFriend.login,
				image: currentFriend.image,
				onlineStatus: false,
			}));
			return response.status(200).json({ friends });
		} catch (error) {
			console.error('FRIENDS ERROR: ', error);
			return response
				.status(400)
				.json({ message: 'Could not retrieve friends' });
		}
		// return friends;
	}

	@Get(':login')
	async getUserInfo(
		@Param('login') login: string,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		// When mounting desktop, user/:login (old user/me) is fetched to set userContext.
		// So when fetching for the first time login is unknown.
		// Therefore login from database must be retrieved to updated `login`
		if (login === 'me') {
			const user = await this.prisma.user.findUnique({
				where: { id: request.userId },
			});
			// update login by user's login
			login = user.login;
		}

		const user = await this.prisma.user.findUnique({
			where: { login },
			include: { gamesPlayed: true, friends: true },
		});
		if (!user) {
			// Handle case when user is not found
			return response.status(404).json('User not found');
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
		const targetUser =
			!user.isDefaultProfile && user.targetId !== null
				? await this.prisma.user.findUnique({
						where: { id: user.targetId },
				  })
				: undefined;
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
		if (userRequestingLogin && userRequestingLogin === login) {
			// return user data except its 2fa secret
			const { twoFactorAuthenticationSecret, ...updatedUser } = user;
			const userData = {
				...updatedUser,
				gamesCount: gamesCount,
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				rank: userRank,
				targetLogin: targetUser?.login,
				targetImage: targetUser?.image,
				bestieLogin: bestieUser.bestieLogin,
				bestieImage: bestieUser.bestieImage,
				matchHistory: matchHistory,
				rivalLogin,
				rivalImage,
			};
			return response.status(200).json(userData);
		}
		// else, we only return what is needed for the profile component
		else {
			const profileData = {
				login: user.login,
				image: user.image,
				// add profile information
				gamesCount: gamesCount,
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				rank: userRank,
				targetLogin: targetUser?.login,
				targetImage: targetUser?.image,
				targetDiscoveredByUser: user.targetDiscoveredByUser,
				bestieLogin: bestieUser.bestieLogin,
				bestieImage: bestieUser.bestieImage,
				matchHistory: matchHistory,
				rivalLogin,
				rivalImage,
			};
			return response.status(200).json(profileData);
		}
	}

	// add `login` in friends[]
	@Put(':login/add')
	async addFriend(
		@Param('login') login: string,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			// verify `login` with SearchUserDto
			const errorDto = await this.userService.validateLoginDto(login);
			if (errorDto)
				return response.status(400).json({ message: 'Validation failed' });
			// authenticate requesting user
			const userId = this.userService.authenticateUser(request);
			// retrieve friend's user id
			const friend = await this.prisma.user.findUnique({
				where: { login: login },
			});
			if (!friend)
				return response.status(404).json({ message: 'User not found' });
			// cannot add self
			if (userId === friend.id) {
				return response.status(401).json({ message: 'Cannot add yourself' });
			}
			// add friend
			await this.userService.addFriend(userId, friend.id);
			// return newly added friend object
			return response.status(200).json({
				id: friend.id,
				login: friend.login,
				image: friend.image,
				onlineStatus: false,
			});
		} catch (error) {
			return response.status(400).json({
				message: error,
			});
		}
	}

	// delete `login` in friends[]
	@Delete(':login/delete')
	async deleteFriend(
		@Param('login') login: string,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			// verify `login` with SearchUserDto
			const errorDto = await this.userService.validateLoginDto(login);
			if (errorDto)
				return response.status(400).json({ message: 'Validation failed' });
			// authenticate requesting user
			const userId = this.userService.authenticateUser(request);
			// retrieve friend's user id
			const friend = await this.prisma.user.findUnique({
				where: { login: login },
			});
			// friend not found in db
			if (!friend) response.status(404).json({ message: 'Friend not found' });
			// cannot delete self
			if (userId === friend.id) {
				return response
					.status(401)
					.json({ message: 'Cannot deleter yourself' });
			}
			// delete friend
			await this.userService.deleteFriend(userId, friend.id);
			response.status(200).json({ message: 'Friend deleted successfully' });
		} catch (error) {
			return response.status(400).json({
				error: error,
			});
		}
	}

	@Put('upload')
	@UseInterceptors(
		FileInterceptor('file', {
			// define a custom filter to block evil files
			fileFilter: (request: CustomRequest, file, cb) => {
				// if file extension meet the critera, allow the file to pursue his destiny
				if (file.originalname.match(/^.*\.(jpg|png|jpeg)$/)) cb(null, true);
				else if (file.size > 1024 * 1024 * 4) cb(null, true);
				else {
					// reject the evil file
					cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'file'), false);
				}
			},
			storage: diskStorage({
				destination: './images',
				filename: (request: CustomRequest, file, cb) => {
					// even if filename if renamed safely after user's id and uid
					// add an extra layer of security before handling file saving
					// library that clean up files' name
					const sanitize = require('sanitize-filename');
					// Sanitize the original filename
					file.originalname = sanitize(file.originalname);
					// Sanitize the filename base on sanitized original
					// name used for storage
					file.filename = sanitize(file.originalname);
					// extract user id
					const userId = request.userId;
					// extract mimetype line from file's data and split
					const parts = file.mimetype.split('/');
					// if not only one '/' is found throw error
					if (parts.length !== 2) throw 'Invalid mimetype format';
					// get part after '/'
					const extensionName = parts[1];
					// this should be the extension name
					const newFilename = `${userId}_${Date.now()}.${extensionName}`;
					// callback with the newfilename as argument
					cb(null, newFilename);
				},
			}),
		}),
	)
	async uploadAvatar(
		@Req() request: CustomRequest,
		@Res() response: Response,
		@UploadedFile(
			// extra layer of security
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
					new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
				],
			}),
		)
		file: Express.Multer.File,
	) {
		try {
			// get userId
			const userId = this.userService.authenticateUser(request);
			if (!userId)
				return response.status(401).json({ message: 'User is unauthorized' });
			// upload new avatar
			await this.userService.uploadAvatar(file, userId);
			// send response ok with the avatar's filename
			return response.status(200).json({ image: file.filename });
		} catch (error) {
			response.status(400).json({ message: error });
		}
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
	@Get('me/chats')
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
				const room = await this.chatService.getRoom(currentChat.chatId);
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
						name: currentRoom.name || name,
						avatar: currentRoom.isChannel ? null : avatar,
						isChannel: currentRoom.isChannel,
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
				const room = await this.chatService.getRoom(currentChat.chatId);
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
						isChannel: currentRoom.isChannel,
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

	@Delete('/unblockUser')
	async leaveChat(
		// @Body() leaveChannel: LeaveChannelDTO,
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
						.unblockUser(userId, validatedData.userId)
						.then(() => {
							res.status(200).json({ message: 'User unblocked successfully' });
						})
						.catch((e) => {
							throw new Error('could not unblock user: ' + e.message);
						});
				})
				.catch(() => {
					res.status(404).json({ message: 'Could not find user to unblock' });
					throw new Error('Could find user to unblock');
				});
		} catch (e) {
			console.error('👋👋👋error unblocking user', e);
			response
				.status(400)
				.json({ message: 'Something went wrong unblocking the user' });
		}
	}
	// get list of blocked users
	@Get('/me/blockedUsers')
	async getBlockedUsers(@Req() request: CustomRequest, @Res() res: Response) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			this.userService
				.getBlockedUsers(userId)
				.then((response) => {
					res.status(200).json(response.blockedUsers);
				})
				.catch((e) => {
					res.status(400).json(e.message);
				});
		} catch (e) {
			console.error(e.message);
			res.status(400).json({ message: 'Could not retreive blocked users' });
		}
	}
}
