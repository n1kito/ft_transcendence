import {
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest, UserWithRelations } from './user.controller';
import { Prisma, User, gameSession } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { IMatchHistory } from 'shared-lib/types/user';
import * as fs from 'fs';
import { constants } from 'fs';
import { SearchUserDto } from './dto/search-user.dto';

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
