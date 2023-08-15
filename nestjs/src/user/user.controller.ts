import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Put,
	Req,
	Response,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/services/prisma-service/prisma.service';

export interface CustomRequest extends Request {
	userId: number;
}

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
	) {}

	@Get('me')
	async getMyinfo(@Req() request: CustomRequest) {
		console.log('GET MY INFO\n request.userId: ' + request.userId);
		const userId = request.userId;
		if (!userId) {
			// If request.userId is not available, return an error or appropriate response
			return { error: 'Authentication required' };
		}

		// Fetch the user information from the database using the userId
		const user = await this.prisma.user.findUnique({
			where: { id: request.userId },
		});

		if (!user) {
			// Handle case when user is not found
			return { message: 'User not found' };
		}

		// Get user games count
		const gamesCount = await this.prisma.game.count({
			where: {
				OR: [{ player1Id: user.id }, { player2Id: user.id }],
			},
		});

		// Find the user's bestie
		// Is it better to do it each time we fetch the user's info, or when it is updated instead ? Like if they play a new game we update the bestie at the same time

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
			login: user.login,
			email: user.email,
			image: user.image,
			killCount: user.killCount,
			gamesCount: gamesCount,
			winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
			rank: userRank,
		};
	}

	@Put('me/update')
	async updateMyUser(
		@Body() updateUserDto: UpdateUserDto,
		@Req() request: CustomRequest,
		@Response() res: any,
	) {
		const userId = this.userService.authenticateUser(request);

		const { login } = updateUserDto;
		if (login) {
			const usernameTaken = await this.userService.isUsernameTaken(login);
			if (usernameTaken) {
				console.log('username is already taken');
				res
					.status(HttpStatus.BAD_REQUEST)
					.json({ error: 'Username is already taken' });
				return;
			}
		}

		try {
			await this.userService.updateUser(userId, updateUserDto);

			return { message: 'User updated successfully' };
		} catch (error) {
			return { error: 'Failed to update user' };
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
			login: currentFriend.login,
			image: currentFriend.image,
		}));
		return friends;
	}

	// TODO: why do we have this and the /me endpoint ?
	// TODO: switch this endpoint to userID
	// TODO: move the logics to user.service.ts ?
	@Get(':login')
	async getUserInfo(
		@Param('login') login: string,
		@Req() request: CustomRequest,
	) {
		const user = await this.prisma.user.findUnique({
			where: { login },
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
		const gamesCount = await this.prisma.game.count({
			where: {
				OR: [{ player1Id: user.id }, { player2Id: user.id }],
			},
		});
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
		// if the login of the user who sent the request is the same as the login of the user they want the info of,
		// we return more information
		if (userRequestingLogin && userRequestingLogin === login)
			return {
				login: user.login,
				email: user.email,
				createdAt: user.createdAt,
				image: user.image,
				// TODO: I bet this should be able to be stored in a separate object and just expanding into the return object
				// add profile information
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				gamesCount: gamesCount,
				rank: userRank,
			};
		else
			return {
				login: user.login,
				image: user.image,
				// add profile information
				killCount: user.killCount,
				winRate: gamesCount > 0 ? (user.killCount / gamesCount) * 100 : 0,
				gamesCount: gamesCount,
				rank: userRank,
			};
	}
}
