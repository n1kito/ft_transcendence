import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		const updatedUser = await this.prisma.user.update({
			where: { id: userId },
			data: {
				email: updateUserDto.email,
				login: updateUserDto.login,
			},
		});

		return updatedUser;
	}
}
