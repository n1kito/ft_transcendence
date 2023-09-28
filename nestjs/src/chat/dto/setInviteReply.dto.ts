import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
} from 'class-validator';

export class SetInviteReplyDTO {
	@IsNotEmpty()
	@IsNumber()
	@IsDefined()
	messageId: number;

	@IsNotEmpty()
	@IsBoolean()
	@IsDefined()
	reply: boolean;
}
