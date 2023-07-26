import { Controller, Get, Param, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface CustomRequest extends Request {
	userId: number;
}

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// TODO: switch this endpoint to userID
	// TODO: move the logics to user.service.ts ?
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
