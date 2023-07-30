import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
	@IsAlpha()
	@IsString()
	@IsNotEmpty()
	readonly login: string;

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;
}
