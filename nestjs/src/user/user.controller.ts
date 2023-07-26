import { Body, Controller, Get, Param, Put, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

const prisma = new PrismaClient();

interface CustomRequest extends Request {
	userId: number;
}

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	async getMyinfo(@Req() request: CustomRequest) {
		console.log('GET MY INFO\n request.userId: ' + request.userId);
		const userId = request.userId;
		if (!userId) {
			// If request.userId is not available, return an error or appropriate response
			return { error: 'Authentication required' };
		}

		// Fetch the user information from the database using the userId
		const user = await prisma.user.findUnique({
			where: { id: request.userId },
		});

		if (!user) {
			// Handle case when user is not found
			return { message: 'User not found' };
		}

		// Return the user information
		return {
			login: user.login,
			email: user.email,
			image: user.image,
		};
	}

	@Put('me/update')
	async updateMyUser(
		@Body() updateUserDto: UpdateUserDto,
		@Req() request: CustomRequest,
	) {
		const userId = request?.userId;
		if (!userId) {
			return { error: 'Authentication required' };
		}
		try {
			await this.userService.updateUser(userId, updateUserDto);

			return { message: 'User updated successfully' };
		} catch (error) {
			return { error: 'Failed to update user' };
		}
	}

	// TODO: switch this endpoint to userID
	@Get(':login')
	async getUserInfo(
		@Param('login') login: string,
		@Req() request: CustomRequest,
	) {
		const user = await prisma.user.findUnique({
			where: { login },
		});
		if (!user) {
			// Handle case when user is not found
			return { message: 'User not found' };
		}
		// identify the login associated with the ID the request is coming from
		const userRequesting = await prisma.user.findUnique({
			where: { id: request.userId },
		});
		const userRequestingLogin = userRequesting?.login;
		// if the login of the user who sent the request is the same as the login of the user they want the info of,
		// we return more information
		if (userRequestingLogin && userRequestingLogin === login)
			return {
				login: user.login,
				email: user.email,
				createdAt: user.createdAt,
				image: user.image,
				firstName: user.firstName,
				lastName: user.lastName,
			};
		else
			return {
				login: user.login,
				image: user.image,
				// add more options to return here
			};
	}
}
