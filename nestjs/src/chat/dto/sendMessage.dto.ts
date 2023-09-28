import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

export class SendMessageDTO {
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

	@IsNotEmpty()
	@IsString()
	@MaxLength(6)
	@IsDefined()
	@IsOptional()
	isNotif?: string;

	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	@IsOptional()
	targetId?: number;


	@IsNotEmpty()
	@IsString()
	@IsOptional()
	@MaxLength(35)
	@MinLength(2)
	@IsDefined()
	channelInvitation?: string;

}
