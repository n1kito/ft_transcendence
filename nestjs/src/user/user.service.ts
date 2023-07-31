import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
	Res,
	ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Request, response, Response } from 'express';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest } from './user.controller';
import { Prisma } from '@prisma/client';
import { plainToClass } from 'class-transformer';

export class CustomException extends HttpException {
	constructor(
		errors: { statusCode: number; field: string; message: string }[],
	) {
		super({ errors }, HttpStatus.BAD_REQUEST);
	}
}

@Injectable()
export class UserService {
	private errors: { field: string; message: string; statusCode: number }[] = [];

	constructor(private readonly prisma: PrismaService) {}

	private pushError(field: string, message: string, statusCode: number) {
		this.errors.push({ field, message, statusCode });
	}
	authenticateUser(request: CustomRequest): number {
		const userId = request.userId;
		if (!userId) {
			throw new NotFoundException('Authentication required');
		}
		return userId;
	}

	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		this.errors = [];
		try {
			await this.validateUpdateUserDto(updateUserDto);
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
					this.pushError(
						usernameError.field,
						usernameError.message,
						HttpStatus.CONFLICT,
					);
				}
				const emailError = this.isUniqueError(error, 'email');
				if (emailError) {
					this.pushError(
						emailError.field,
						emailError.message,
						HttpStatus.CONFLICT,
					);
				}
				if (this.errors.length > 0) {
					throw new CustomException(this.errors);
				} else {
					throw new HttpException(
						{
							statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
							error: 'Internal Server Error',
							message: 'Something went wrong.',
						},
						HttpStatus.INTERNAL_SERVER_ERROR,
					);
				}
			} else {
				throw error;
			}
		}
	}

	async validateUpdateUserDto(updateUserDto: UpdateUserDto): Promise<void> {
		const classValidatorErrors: ValidationError[] = await validate(
			plainToClass(UpdateUserDto, updateUserDto),
		);

		if (classValidatorErrors.length > 0) {
			const errors: { field: string; message: string }[] = [];
			for (const error of classValidatorErrors) {
				for (const constraintKey of Object.keys(error.constraints)) {
					const field = error.property;
					const message = error.constraints[constraintKey];
					this.pushError(field, message, HttpStatus.BAD_REQUEST);
				}
			}
		}
	}

	private isUniqueError(
		error: any,
		field: string,
	): { field: string; message: string } | null {
		if (error.code === 'P2002' && error.meta?.target?.includes(field)) {
			const message = `${field} already exists`;
			console.log('isUniqueError:', field, message);
			return { field, message };
		}
		console.log('isUniqueError not found');
		return null;
	}
}
