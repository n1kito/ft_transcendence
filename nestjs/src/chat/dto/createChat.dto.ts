import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	NotContains,
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

	// TODO: do I need to escape more characters?
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@NotContains('/')
	@NotContains('\\')
	name?: string;
}
