import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class LeaveChannelDTO {
	@IsNumber()
	@IsNotEmpty()
	chatId: number;
}
