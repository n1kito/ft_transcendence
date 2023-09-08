import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendMessageDTO {
	@IsNotEmpty()
    @IsString()
	message: string;

	@IsNumber()
	chatId: number;
}
