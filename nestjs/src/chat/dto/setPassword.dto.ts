import {
	IsAlphanumeric,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	NotContains,
} from 'class-validator';

export class SetPasswordDTO {
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsDefined()
	@NotContains('/')
	@NotContains('\\')
	@NotContains(';')
	@NotContains(' ')
	@MinLength(7) 
	@MaxLength(20)
	password?: string;

	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	chatId: number;
}
