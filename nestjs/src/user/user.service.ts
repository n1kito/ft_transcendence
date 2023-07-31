import {
	BadRequestException,
	ConflictException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	Res,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Request, response, Response } from 'express';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest } from './user.controller';
import { Prisma } from '@prisma/client';
import { plainToClass } from 'class-transformer';

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
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				const usernameError = this.isUniqueError(error, 'login');
				if (usernameError) {
					throw new ConflictException(usernameError.message, 'login');
				}
				const emailError = this.isUniqueError(error, 'email');
				if (emailError) {
					throw new ConflictException(emailError.message, 'email');
				} else {
					throw new ConflictException('Conflict occurred.');
				}
			} else {
				throw error; // Re-throw other errors if needed
			}
		}
	}

	async validateUpdateUserDto(updateUserDto: UpdateUserDto): Promise<void> {
		// Validate the UpdateUserDto using class-validator library
		const errors = await validate(plainToClass(UpdateUserDto, updateUserDto));

		console.log(errors);
		if (errors.length > 0) {
			// If validation errors are found, throw a BadRequestException with the validation errors
			throw new BadRequestException(errors);
		}
	}

	// Move the error handling logic to the UserService
	handleErrorResponse(response: Response, error: any) {
		console.log('handleErrorResponse');
		if (error instanceof HttpException) {
			if (error instanceof BadRequestException) {
				// If validation errors occurred, return the array of error messages in the response
				response
					.status(HttpStatus.BAD_REQUEST)
					.json({ errors: error.getResponse() });
			} else if (error instanceof ConflictException) {
				// For other HttpExceptions, return the error response with status code and message
				const errorResponse = {
					statusCode: error.getStatus(),
					message: error.message,
					error: error.getResponse()['error'],
					field: error.getResponse()['field'],
				};
				response.status(error.getStatus()).json({ errors: [errorResponse] });
			}
		} else {
			// For non-HttpException errors, return a generic error response
			response.status(500).json({ error: 'Failed to update user' });
		}
		console.log(response.statusMessage);
	}

	// search if input already exists in the database
	// private isUniqueError(error: any, field: string): string | null {
	// 	if (error.code === 'P2002' && error.meta?.target?.includes(field)) {
	// 		return field;
	// 	}
	// 	return null;
	// }

	private isUniqueError(
		error: any,
		field: string,
	): { field: string; message: string } | null {
		if (error.code === 'P2002' && error.meta?.target?.includes(field)) {
			const message = `${field} already exists`;
			return { field, message };
		}
		return null;
	}
}
