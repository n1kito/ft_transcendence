import { IsDefined, IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class LeaveChannelDTO {
	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	chatId: number;
}
