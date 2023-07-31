import {
	IsAlpha,
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsAlpha()
	@IsString()
	@IsNotEmpty()
	readonly login?: string;

	@IsOptional()
	@IsEmail()
	@IsNotEmpty()
	readonly email?: string;
}
