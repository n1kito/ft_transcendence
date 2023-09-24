import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	Res,
	ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Request, response, Response } from 'express';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest, UserWithRelations } from './user.controller';
import { Prisma, User, gameSession } from '@prisma/client';
import { plainToClass } from 'class-transformer';
// import { IMatchHistory } from 'shared-types';
import { IMatchHistory } from 'shared-lib/types/user';

//  custom exception class to store an array of errors each containing
// `statusCode` `field` and `message` properties.
export class CustomException extends HttpException {
	constructor(
		errors: { statusCode: number; field: string; message: string }[],
	) {
		super({ errors }, errors[0].statusCode);
	}
}

// Define a custom type that is a game session with users included
type GameSessionWithUsers = gameSession & {
	player1: User;
	player2: User;
};

@Injectable()
export class UserService {
	// array of errors that can be thrown all at once
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

	// update the user data with the provided 'updateUserDto'
	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		// clean up errors[]
		this.errors = [];
		try {
			// looks for validation errors
			await this.validateUpdateUserDto(updateUserDto);
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: {
					email: updateUserDto.email,
					login: updateUserDto.login,
				},
			});
			// Check if there are any validation errors from dto, throw error
			if (this.errors.length > 0) {
				throw new CustomException(this.errors);
			}
			return updatedUser;
		} catch (error) {
			// Handle Prisma database errors
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				const usernameError = this.isUniqueError(error, 'login');
				const emailError = this.isUniqueError(error, 'email');
			}
			// Check for any errors like Validation errors ou Prisma errors
			if (this.errors.length > 0) {
				throw new CustomException(this.errors);
			} else throw error; // throw other errors
		}
	}

	// Using class-validator, adds any validation errors to the 'errors' property
	//with corresponding fields and sets the status code to 'HttpStatus.BAD_REQUEST'.
	async validateUpdateUserDto(updateUserDto: UpdateUserDto): Promise<void> {
		// converts the plain js object updateUserDto into an instance of the 'UpdateUserDto class'
		// Any dto errors are stored in classValidatorErrors
		const classValidatorErrors: ValidationError[] = await validate(
			plainToClass(UpdateUserDto, updateUserDto),
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

	// check for duplicate while updating user data.
	private isUniqueError(error: any, field: string) {
		// searching for error that matches with unique constraint violation code on a specified `field`,
		if (error.code === 'P2002' && error.meta?.target?.includes(field)) {
			this.pushError(field, `${field} already exists`, HttpStatus.CONFLICT);
		}
	}

	// // finds a user's rival
	// async findUserRival(
	// 	userId: number,
	// ): Promise<{ rivalLogin: string; rivalImage: string }> {
	// 	// Get the games our user has been apart of
	// 	const userGames = await this.prisma.gameSession.findMany({
	// 		where: { userId: userId },
	// 	});
	// 	// Create an object to tally up how many times our user has lost againt each foe
	// 	const rivalScores: { [key: number]: number } = {};

	// 	// Iterate through games and count our losses against each enemy
	// 	for (const game of userGames) {
	// 		// If we lost
	// 		if (!game.isWinner) {
	// 			// Find the winner
	// 			const winner = await this.prisma.gameSession.findFirst({
	// 				where: { gameId: game.gameId, isWinner: true },
	// 			});
	// 			// Increment the count for this rival
	// 			if (winner)
	// 				rivalScores[winner.userId] = (rivalScores[winner.userId] || 0) + 1;
	// 		}
	// 	}

	// 	// Identify the rival
	// 	let rival;
	// 	const keys = Object.keys(rivalScores);
	// 	if (keys.length !== 0) {
	// 		const rivalId = keys.reduce(
	// 			(a, b) => (rivalScores[a] > rivalScores[b] ? a : b),
	// 			keys[0],
	// 		);
	// 		// Retrieve the full User record for this rival
	// 		rival = await this.prisma.user.findUnique({
	// 			where: { id: parseInt(rivalId) },
	// 		});
	// 	}

	// 	return { rivalLogin: rival?.login || '', rivalImage: rival?.image || '' };
	// }

	// async findUserBestie(
	// 	userId: number,
	// ): Promise<{ bestieLogin: string; bestieImage: string }> {
	// 	// Get the games our user has been apart of
	// 	const gamesPlayed = await this.prisma.gameSession.findMany({
	// 		where: {
	// 			userId: userId,
	// 		},
	// 		include: {
	// 			game: {
	// 				include: {
	// 					players: true,
	// 				},
	// 			},
	// 		},
	// 	});
	// 	// Create an object to tally up how many times our user has played againt each player
	// 	const opponentsCount: Record<number, number> = {};
	// 	// Iterate through games and count our losses against each enemy
	// 	gamesPlayed.forEach((gamePlayed) => {
	// 		// For each game, iterate through the two players
	// 		gamePlayed.game.players.forEach((participant) => {
	// 			// For each player of the game, if the player is not our user, add a count to the opponentsCount object corresponding to their id
	// 			if (participant.userId !== userId)
	// 				opponentsCount[participant.userId] =
	// 					(opponentsCount[participant.userId] || 0) + 1;
	// 		});
	// 	});
	// 	// Find the most played opponent's id
	// 	let mostPlayedOpponent;
	// 	const keys = Object.keys(opponentsCount);
	// 	if (keys.length !== 0) {
	// 		const mostPlayedOpponentId = Object.keys(opponentsCount).reduce((a, b) =>
	// 			opponentsCount[a] > opponentsCount[b] ? a : b,
	// 		);
	// 		mostPlayedOpponent = await this.prisma.user.findUnique({
	// 			where: { id: parseInt(mostPlayedOpponentId) },
	// 		});
	// 	}
	// 	return {
	// 		bestieLogin: mostPlayedOpponent?.login || '',
	// 		bestieImage: mostPlayedOpponent?.image || '',
	// 	};
	// }

	async getUserByIdWithRelations(userId: number): Promise<UserWithRelations> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				gamesPlayedAsPlayer1: {
					include: { player1: true, player2: true },
				},
				gamesPlayedAsPlayer2: {
					include: { player1: true, player2: true },
				},
				gamesWon: true,
				target: true,
				rival: true,
				bestie: true,
			},
		});
		if (!user) throw new NotFoundException('Requesting user not found');
		return user;
	}

	async getUserByLoginWithRelations(
		userLogin: string,
	): Promise<UserWithRelations> {
		const user = await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			},
			include: {
				gamesPlayedAsPlayer1: {
					include: { player1: true, player2: true },
				},
				gamesPlayedAsPlayer2: {
					include: { player1: true, player2: true },
				},
				gamesWon: true,
				target: true,
				rival: true,
				bestie: true,
			},
		});
		if (!user) throw new NotFoundException('Requested user not found');
		return user;
	}

	calculateTotalGameCount(user: UserWithRelations): number {
		return user.gamesPlayedAsPlayer1.length + user.gamesPlayedAsPlayer2.length;
	}

	calculateWinRate(user: UserWithRelations): number | undefined {
		return user.gamesWon.length > 0
			? (user.gamesWon.length / this.calculateTotalGameCount(user)) * 100
			: undefined;
	}

	// This returns the rank of our user, following each user's number of wins
	// If two users have the same number of wins, the user who has won most
	// recently takes the higher rank.
	async calculateRank(userId: number): Promise<number | undefined> {
		// Aggregate and sort our winners
		const leaderboard = await this.prisma.gameSession.groupBy({
			by: ['winnerId'],
			_count: {
				winnerId: true,
			},
			_max: {
				createdAt: true,
			},
			orderBy: [
				{
					_count: {
						winnerId: 'desc',
					},
				},
				{
					_max: {
						createdAt: 'desc',
					},
				},
			],
		});
		// Find Rank
		const userRank =
			leaderboard.findIndex((entry) => entry.winnerId === userId) + 1;
		return userRank > 0 ? userRank : undefined;
	}

	getUserMatchHistory(
		gamesPlayedAsPlayer1: GameSessionWithUsers[],
		gamesPlayedAsPlayer2: GameSessionWithUsers[],
	): IMatchHistory[] | undefined {
		// If both game arrays are empty, return undefined
		if (!gamesPlayedAsPlayer1 && !gamesPlayedAsPlayer2) return undefined;
		const combinedGameSessions = [
			...gamesPlayedAsPlayer1,
			...gamesPlayedAsPlayer2,
		];
		combinedGameSessions.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		);
		const filteredGameSessions = combinedGameSessions.map((session) => ({
			player1Login: session.player1.login,
			player1Score: session.player1Score,
			player1Image: session.player1.image,
			player2Login: session.player2.login,
			player2Score: session.player2Score,
			player2Image: session.player2.image,
		}));
		return filteredGameSessions;
	}

	// async getUserMatchHistory(userId: number): Promise<IMatchHistory[]> {
	// 	// Get games session user has been a part of
	// 	const gameSessions = await this.prisma.gameSession.findMany({
	// 		where: {
	// 			userId: userId,
	// 		},
	// 		include: {
	// 			user: true,
	// 			game: {
	// 				include: {
	// 					players: {
	// 						include: {
	// 							user: true,
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});

	// 	// Transform them into the IMatchHistory structure
	// 	return gameSessions.map((gameSession) => {
	// 		const players = gameSession.game.players;

	// 		// Make sure there are two players in the game
	// 		if (players.length !== 2)
	// 			throw new Error('Games should have exactly two players.');

	// 		const [player1, player2] = players;

	// 		return {
	// 			player1Login: player1.user.login,
	// 			player1Score: player1.score,
	// 			player1Image: player1.user.image || '',
	// 			player2Login: player2.user.login,
	// 			player2Score: player2.score,
	// 			player2Image: player2.user.image || '',
	// 		};
	// 	});
	// }
}
