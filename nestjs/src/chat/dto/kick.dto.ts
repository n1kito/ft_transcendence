import {
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsString,
	MaxLength,
} from 'class-validator';

export class KickDTO {
	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	chatId: number;

	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	targetId: number;
}
