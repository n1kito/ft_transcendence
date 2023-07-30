import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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

	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		try {
			// update the user's data with prisma client
			const updatedUser = await this.prisma.user.update({
				where: { id: userId },
				data: {
					email: updateUserDto.email,
					login: updateUserDto.login,
				},
			});
			return updatedUser;
		} catch (error) {
			const field = this.isUniqueError(error, 'login');
			if (field) {
				throw new ConflictException({
					error: 'Conflict',
					message: 'Username already exists',
					field,
				});
			} else {
				throw new Error('Failed to update user');
			}
		}
	}

	// search if
	private isUniqueError(error: any, field: string): string | null {
		if (error.code === 'P2002' && error.meta?.target?.includes(field)) {
			return field;
		}
		return null;
	}
}
