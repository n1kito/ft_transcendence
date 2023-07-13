import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	// TODO: switch this endpoint to userID
	@Get(':login')
	async getUserInfo(@Param('login') login: string) {
		// console.log('login: ' + login);
		const email = 'mjallada@student.42.fr';
		const user = await prisma.user.findUnique({
			where: { email },
		});
		const imageURL = user?.image;
		// console.log('URL: ' + userLogin);
		return { image: imageURL };
	}
}
