import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateChatDTO {
	@IsBoolean()
	@IsNotEmpty()
	isChannel: boolean;

	@IsBoolean()
	@IsNotEmpty()
	isPrivate: boolean;

	@IsBoolean()
	@IsNotEmpty()
	isProtected: boolean;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	password?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsNumber()
	userId?: number;
}
