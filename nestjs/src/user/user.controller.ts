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
import { twoFactorAuthenticationCodeDto } from 'src/auth/dto/two-factor-auth-code.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export interface CustomRequest extends Request {
	userId: number;
}

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
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
		if (userRequestingLogin && userRequestingLogin === login) {
			// return user data except its 2fa secret
			const { twoFactorAuthenticationSecret, ...updatedUser } = user;
			return {
				...updatedUser,
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
				// friends: this.getUserFriends,
			};
		}
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

	// TODO: add DTO
	@Put(':login/add')
	async addFriend(
		@Param('login') login: string,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			// init searchUserDto
			const searchUserDto = new SearchUserDto();
			searchUserDto.login = login;

			// Validate the searchUserDto
			const errors = await validate(searchUserDto);

			if (errors.length > 0) {
				return response.status(400).json({ message: 'Validation failed' });
			}

			const userId = this.userService.authenticateUser(request);

			// retrieve friend's user id
			const friend = await this.prisma.user.findUnique({
				where: { login: login },
			});
			if (!friend)
				return response.status(404).json({ message: 'User not found' });

			if (userId === friend.id) {
				return response.status(401).json({ message: 'Cannot add yourself' });
			}

			await this.userService.addFriend(userId, friend.id);
			return response
				.status(200)
				.json({ message: 'Friend added successfully' });
		} catch (error) {
			console.error(error);
			return response.status(500).json({
				error: error,
			});
		}
	}

	// TODO: add DTO
	@Delete(':login/delete')
	async deleteFriend(
		@Param('login') login: string,
		@Req() request: CustomRequest,
		@Res() response: Response,
	) {
		try {
			const userId = this.userService.authenticateUser(request);

			// retrieve friend's user id
			const plop = await this.prisma.user.findUnique({
				where: { login: login },
			});

			if (!plop) response.status(404).json({ message: 'Friend not found' });

			await this.userService.deleteFriend(userId, plop.id);
			response.status(200).json({ message: 'Friend deleted successfully' });
		} catch (error) {
			return response.status(500).json({
				error: error,
			});
		}
	}

	@Put('upload')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './images',
				filename: (request: CustomRequest, file, cb) => {
					// /api/images/userId.jpeg

					// extract user id
					const userId = request.userId;

					// extract mimetype line from file's data and split
					const parts = file.mimetype.split('/');
					// if not only one '/' is found throw error
					if (parts.length !== 2) throw new Error('Invalid mimetype format');
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
			const userId = this.userService.authenticateUser(request);
			if (!userId)
				return response.status(401).json({ message: 'User is unauthorized' });

			let imagePath = await this.userService.uploadAvatar(file, userId);
			console.log('🍧 image path:', imagePath);
			if (imagePath) {
				return response.status(200).json({ image: imagePath });
			}
		} catch (error) {
			response.status(400).json({ message: error });
		}
	}
}
