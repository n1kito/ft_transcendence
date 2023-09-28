import {
	Body,
	Controller,
	Get,
	HttpStatus,
	NotFoundException,
	Param,
	Put,
	Req,
	Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { IUserData, IMatchHistory } from 'shared-lib/types/user';

export interface CustomRequest extends Request {
	userId: number;
}

export type UserWithRelations = Prisma.UserGetPayload<{
	include: {
		gamesPlayedAsPlayer1: {
			include: { player1: true; player2: true };
		};
		gamesPlayedAsPlayer2: {
			include: { player1: true; player2: true };
		};
		gamesWon: true;
		target: true;
		rival: true;
		bestie: true;
	};
}>;

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly prisma: PrismaService,
	) {}

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
			await this.prisma.user.update({
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
		// Only select some fields for each friend
		const friends = userRequesting.friends.map((currentFriend) => ({
			login: currentFriend.login,
			image: currentFriend.image,
		}));
		return friends;
	}

	@Get(':login')
	async getUserInfo(
		@Param('login') login: string,
		@Req() request: CustomRequest,
	): Promise<IUserData> {
		console.log(`[🙆🏻‍♂️] User data requested via /user/${login}`);
		try {
			// Try to authenticate the user
			const requestingUserId: number =
				this.userService.authenticateUser(request);
			// Find the database entry corresponding to the user
			const requestingUser: UserWithRelations =
				await this.userService.getUserByIdWithRelations(requestingUserId);
			// See if the user requesting the info is requesting their own information
			const userWantsTheirOwnInfo: boolean =
				login === 'me' || requestingUser.login === login;
			// If the user is trying to fetch someone else's information, retrieve that
			let requestedUser: UserWithRelations;
			if (userWantsTheirOwnInfo) requestedUser = requestingUser;
			else
				requestedUser = await this.userService.getUserByLoginWithRelations(
					login,
				);

			// Calculate the dynamic information
			const calculatedRank: number | undefined =
				await this.userService.calculateRank(requestedUser.id);
			const totalGameCount =
				this.userService.calculateTotalGameCount(requestedUser);
			const calculatedWinRate: number | undefined = Math.round(
				this.userService.calculateWinRate(requestedUser),
			);

			// Match history
			let matchHistory: IMatchHistory[] | undefined = undefined;
			if (totalGameCount > 0)
				matchHistory = this.userService.getUserMatchHistory(
					requestedUser.gamesPlayedAsPlayer1,
					requestedUser.gamesPlayedAsPlayer2,
				);

			return {
				id: userWantsTheirOwnInfo ? requestedUser.id : undefined,
				login: requestedUser.login,
				image: requestedUser.image,
				email: userWantsTheirOwnInfo ? requestedUser.email : undefined,
				killCount: requestedUser.killCount,
				rank: calculatedRank,
				winRate: calculatedWinRate,
				gamesCount: totalGameCount,
				// Target
				targetLogin: requestedUser.target?.login,
				targetImage: requestedUser.target?.image,
				targetDiscoveredByUser: requestedUser.targetDiscoveredByUser,
				// Bestie
				bestieLogin: requestedUser.bestie?.login,
				matchHistory: matchHistory,
				// Rival
				rivalLogin: requestedUser.rival?.login,
				rivalImage: requestedUser.rival?.image,
			};
		} catch (error) {
			throw new NotFoundException(error);
		}
	}
}
