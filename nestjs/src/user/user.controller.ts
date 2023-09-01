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
} from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { Request, response, Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { validate } from 'class-validator';
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
		const userId = this.userService.authenticateUser(request);

		// Fetch the user information from the database using the userId
		const user = await this.prisma.user.findUnique({ 
			where: { id: request.userId },
			include: {
				friends: true,
			}
		});

		// Handle case when user is not found
		if (!user) {
			return { message: 'User not found' };
		}

		// Return the user information
		return {
			id: user.id,
			login: user.login,
			email: user.email,
			image: user.image,
			friends: user.friends,
			isTwoFaEnabled: user.isTwoFactorAuthenticationEnabled,
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
		}));
		return friends;
	}

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
		// if the login of the user who sent the request is the same as the login of the user they want the info of,
		// we return more information
		if (userRequestingLogin && userRequestingLogin === login)
			return {
				login: user.login,
				email: user.email,
				createdAt: user.createdAt,
				image: user.image,
			};
		else
			return {
				login: user.login,
				image: user.image,
				// add more options to return here
			};
	}

	
}
