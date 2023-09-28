import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
	NotContains,
} from 'class-validator';

export class InviteDTO {
	@IsNotEmpty()
	@IsNumber()
	@IsDefined()
	channelId: number;

	@IsNotEmpty()
	@IsNumber()
	@IsDefined()
	secondUserId: number;
}
