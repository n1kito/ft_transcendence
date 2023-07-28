import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest } from './user.controller';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	authenticateUser(request: CustomRequest): number {
		const userId = request.userId;
		if (!userId) {
			throw new NotFoundException('Authentication required');
		}
		return userId;
	}

	// TODO: uncomment line 14 after merging with nikito's friends list
	async isUsernameTaken(username: string): Promise<boolean> {
		const user = await this.prisma.user.findUnique({
			where: { login: username },
		});
		// if (user) return true;
		return true;
	}

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
	}
}
