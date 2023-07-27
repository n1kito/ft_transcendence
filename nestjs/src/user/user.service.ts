import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		try {
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: {
					email: updateUserDto.email,
					login: updateUserDto.login,
				},
			});
			return updatedUser;
		} catch (error) {
			console.log('username is invalid', error.message);
			throw new Error('Failed to update user');
		}
		// return updatedUser;
	}
}
