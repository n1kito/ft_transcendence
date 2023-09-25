import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	NotContains,
} from 'class-validator';

export class CreateChatDTO {
	@IsBoolean()
	@IsNotEmpty()
	@IsDefined()
	isChannel: boolean;

	@IsBoolean()
	@IsNotEmpty()
	@IsDefined()
	isPrivate: boolean;

	@IsBoolean()
	@IsNotEmpty()
	@IsDefined()
	isProtected: boolean;

	// 60 is size of the returned hash
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsDefined()
	@NotContains('\\')
	@NotContains(';')
	@NotContains(' ')
	@MinLength(7)
	@MaxLength(60)
	password?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsNumber()
	@IsDefined()
	userId?: number;

	// TODO: do I need to escape more characters? (add '!' ?)
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@NotContains('/')
	@NotContains('\\')
	@NotContains(';')
	@IsDefined()
	name?: string;
}
