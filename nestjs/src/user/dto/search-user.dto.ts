import {
	IsAlphanumeric,
	IsBoolean,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class SearchUserDto {
	@IsString()
	@IsAlphanumeric()
	@IsNotEmpty()
	@MinLength(4)
	@MaxLength(8)
	login: string;
}
