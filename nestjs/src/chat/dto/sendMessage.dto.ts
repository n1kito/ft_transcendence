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
	@IsOptional()
	isNotif?: string;

	@IsNumber()
	@IsNotEmpty()
	@IsOptional()
	targetId?: number;


	@IsNotEmpty()
	@IsString()
	@IsOptional()
	channelInvitation?: string;

}
