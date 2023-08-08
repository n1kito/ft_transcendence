import { IsAlpha, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
	@IsAlpha()
	@IsString()
	@IsNotEmpty()
	login: string;

	@IsEmail()
	@IsNotEmpty()
	email: string;
}
