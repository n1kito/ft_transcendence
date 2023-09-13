import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class SendMessageDTO {
	@IsNotEmpty()
    @IsString()
	@MaxLength(500)
	message: string;

	@IsNumber()
	@IsNotEmpty()
	chatId: number;
}
