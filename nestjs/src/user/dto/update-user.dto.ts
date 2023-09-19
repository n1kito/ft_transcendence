import {
	IsAlphanumeric,
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsAlphanumeric()
	@IsString()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(8)
	readonly login?: string;

	@IsOptional()
	@IsEmail()
	@IsNotEmpty()
	readonly email?: string;
}
