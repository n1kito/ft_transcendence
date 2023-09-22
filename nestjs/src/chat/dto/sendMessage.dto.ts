import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';

export class SendMessageDTO {
	@IsNotEmpty()
	@IsString()
	@MaxLength(500)
	@IsDefined()
	message: string;

	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	chatId: number;

	@IsNumber()
	@IsNotEmpty()
	@IsOptional()
	@IsDefined()
	userId?: number;
}
