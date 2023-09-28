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
import { CustomRequest } from './user.controller';
import { Prisma } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import { constants } from 'fs';
import { error } from 'console';
import { SearchUserDto } from './dto/search-user.dto';
// import { IMatchHistory } from 'shared-types';

interface IMatchHistory {
	player1Login: string;
	player1Score: number;
	player1Image: string;
	player2Login: string;
	player2Score: number;
	player2Image: string;
}

//  custom exception class to store an array of errors each containing
// `statusCode` `field` and `message` properties.
export class CustomException extends HttpException {
	constructor(
		errors: { statusCode: number; field: string; message: string }[],
	) {
		super({ errors }, errors[0].statusCode);
	}
}

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

			const isLoginLocked: boolean = !!updateUserDto.login;
			const isEmailLocked: boolean = !!updateUserDto.email;

			const lock = await this.prisma.user.update({
				where: { id: userId },
				data: {
					login_is_locked: isLoginLocked,
					email_is_locked: isEmailLocked,
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

	// finds a user's rival
	async findUserRival(
		userId: number,
	): Promise<{ rivalLogin: string; rivalImage: string }> {
		// Get the games our user has been apart of
		const userGames = await this.prisma.gameSession.findMany({
			where: { userId: userId },
		});
		// Create an object to tally up how many times our user has lost againt each foe
		const rivalScores: { [key: number]: number } = {};

		// Iterate through games and count our losses against each enemy
		for (const game of userGames) {
			// If we lost
			if (!game.isWinner) {
				// Find the winner
				const winner = await this.prisma.gameSession.findFirst({
					where: { gameId: game.gameId, isWinner: true },
				});
				// Increment the count for this rival
				if (winner)
					rivalScores[winner.userId] = (rivalScores[winner.userId] || 0) + 1;
			}
		}

		// Identify the rival
		let rival;
		const keys = Object.keys(rivalScores);
		if (keys.length !== 0) {
			const rivalId = keys.reduce(
				(a, b) => (rivalScores[a] > rivalScores[b] ? a : b),
				keys[0],
			);
			// Retrieve the full User record for this rival
			rival = await this.prisma.user.findUnique({
				where: { id: parseInt(rivalId) },
			});
		}

		return { rivalLogin: rival?.login || '', rivalImage: rival?.image || '' };
	}

	async findUserBestie(
		userId: number,
	): Promise<{ bestieLogin: string; bestieImage: string }> {
		// Get the games our user has been apart of
		const gamesPlayed = await this.prisma.gameSession.findMany({
			where: {
				userId: userId,
			},
			include: {
				game: {
					include: {
						players: true,
					},
				},
			},
		});
		// Create an object to tally up how many times our user has played againt each player
		const opponentsCount: Record<number, number> = {};
		// Iterate through games and count our losses against each enemy
		gamesPlayed.forEach((gamePlayed) => {
			// For each game, iterate through the two players
			gamePlayed.game.players.forEach((participant) => {
				// For each player of the game, if the player is not our user, add a count to the opponentsCount object corresponding to their id
				if (participant.userId !== userId)
					opponentsCount[participant.userId] =
						(opponentsCount[participant.userId] || 0) + 1;
			});
		});
		// Find the most played opponent's id
		let mostPlayedOpponent;
		const keys = Object.keys(opponentsCount);
		if (keys.length !== 0) {
			const mostPlayedOpponentId = Object.keys(opponentsCount).reduce((a, b) =>
				opponentsCount[a] > opponentsCount[b] ? a : b,
			);
			mostPlayedOpponent = await this.prisma.user.findUnique({
				where: { id: parseInt(mostPlayedOpponentId) },
			});
		}
		return {
			bestieLogin: mostPlayedOpponent?.login || '',
			bestieImage: mostPlayedOpponent?.image || '',
		};
	}

	async getUserMatchHistory(userId: number): Promise<IMatchHistory[]> {
		// Get games session user has been a part of
		const gameSessions = await this.prisma.gameSession.findMany({
			where: {
				userId: userId,
			},
			include: {
				user: true,
				game: {
					include: {
						players: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		// Transform them into the IMatchHistory structure
		return gameSessions.map((gameSession) => {
			const players = gameSession.game.players;

			// Make sure there are two players in the game
			if (players.length !== 2)
				throw new Error('Games should have exactly two players.');

			const [player1, player2] = players;

			return {
				player1Login: player1.user.login,
				player1Score: player1.score,
				player1Image: player1.user.image || '',
				player2Login: player2.user.login,
				player2Score: player2.score,
				player2Image: player2.user.image || '',
			};
		});
	}

	/* ********************************************************************* */
	/* ******************************* CHAT ******************************** */
	/* ********************************************************************* */

	// get all chat Sessions from the user
	async getChatSessions(userId: number) {
		const response = await this.prisma.user.findUnique({
			// where: { Users: { some: { userId: { in: [request.userId, userId] } } } },
			where: {
				id: userId,
			},
			select: {
				chatsSessions: true,
			},
		});
		return response.chatsSessions;
	}

	// get public data of a user from the userId
	async getPublicDataFromUserId(userId: number) {
		const response = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				login: true,
				image: true,
			},
		});
		return response;
	}

	async blockUser(userId: number, userToBlock: number) {
		const response = await this.prisma.userBlocked.create({
		  data: {
			blockedAt: new Date(),
			userBlockingId: userId, // The user performing the block
			userBlockedId: userToBlock,
		  },
		});
		return response;
	}	

	async unblockUser(userId: number, userToBlock: number) {
		const response = await this.prisma.userBlocked.deleteMany({
			where: {
				userBlockingId: userId,
				userBlockedId: userToBlock,
			}
		});
		return response;
	}	

	async getBlockedUsers(userId: number) {
		const response = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				blockedUsers: true,
			},
		});
		return response;
	}

	// return true if the user is blocked by the second user
	async isUserBlockedBy(userId: number, secondUser: number) {
		const response = await this.prisma.user.findFirst({
			where: {
				id: userId,
			},
			select: {
				blockedBy: true,
			},
		});
		if (!response.blockedBy) return false;
		for (const current of response.blockedBy) {
			if (current.userBlockingId === secondUser) return true;
		}
		return false;
	}

		// return true if the user blocked the second user
		async isUserBlocked(userId: number, secondUser: number) {
			const response = await this.prisma.user.findFirst({
				where: {
					id: userId,
				},
				select: {
					blockedUsers: true,
				},
			});
			if (!response.blockedUsers) return false;
			for (const current of response.blockedUsers) {
				if (current.userBlockedId === secondUser) return true;
			}
			return false;
		}
	async deleteUser(userId: number) {
		try {
			const user = await this.prisma.findUserById(userId);
			// retrieve user's image name in database and create path
			const imagePath = `./images/${user.image}`;
			// delete user
			const isdeleted = await this.prisma.user.delete({
				where: { id: userId },
			});
			// if success then delete static image file im ./images
			fs.access(imagePath, constants.F_OK, (err) => {
				if (err) return;
				fs.unlink(imagePath, (error) => {
					if (error) throw error;
				});
			});
		} catch (error) {
			throw Error('Could not delete user');
		}
	}

	async deleteFriend(userId: number, friendUserIdToDelete: number) {
		try {
			// retrieve user's data including its friends list
			const user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
				include: {
					friends: true,
				},
			});

			if (!user) throw new Error('User not found');

			// in friends array, remove the requested friend by its id
			const updatedFriends = user.friends
				.filter((friend) => friend.id !== friendUserIdToDelete)
				.map((friend) => ({
					id: friend.id,
				}));

			// set the updated friends array
			const updatedUser = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					friends: {
						set: updatedFriends,
					},
				},
			});
		} catch (error) {
			throw new Error('Could not delete friend');
		}
	}

	async addFriend(userId: number, friendUserIdToAdd: number) {
		try {
			// Retrieve user's data including friends list
			let user = await this.prisma.user.findUnique({
				where: {
					id: userId,
				},
				include: {
					friends: true,
				},
			});

			if (!user) throw 'User not found';

			// Check if the friend to add already exists in the user's friends list
			const friendExists = user.friends.some(
				(friend) => friend.id === friendUserIdToAdd,
			);

			if (friendExists) {
				throw 'Already a friend';
			}

			// update user's friends array with the newly added friend
			user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					friends: {
						connect: {
							id: friendUserIdToAdd,
						},
					},
				},
				include: {
					friends: true,
				},
			});
		} catch (error) {
			throw error;
		}
	}

	async uploadAvatar(file: Express.Multer.File, userId: number) {
		// get user in db
		let user = await this.prisma.findUserById(userId);
		if (!user) {
			throw 'User not found';
		}
		// retrieve avatar name in database
		const oldAvatarName = user.image;
		// append it to get filepath
		const filePathToDelete = `./images/${oldAvatarName}`;

		try {
			// update image path in database
			user = await this.prisma.user.update({
				where: {
					id: userId,
				},
				data: {
					image: file.filename,
					image_is_locked: true,
				},
			});
			// if success delete old avatar
			fs.access(filePathToDelete, constants.F_OK, (err) => {
				if (err) console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
				fs.unlink(filePathToDelete, (error) => {
					if (error) throw error;
				});
			});
		} catch (error) {
			throw new Error('Could not update avatar');
		}
	}

	async validateLoginDto(login: string): Promise<boolean> {
		// init searchUserDto
		const searchUserDto = new SearchUserDto();
		searchUserDto.login = login;

		// Validate the searchUserDto
		const errors = await validate(searchUserDto);
		// if found error return true
		return errors.length > 0 ? true : false;
	}
}
