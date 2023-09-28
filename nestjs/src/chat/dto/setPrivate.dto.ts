import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	NotContains,
} from 'class-validator';

export class SetPrivateDTO {
	@IsNumber()
	@IsNotEmpty()
	@IsDefined()
	chatId: number;

	@IsBoolean()
	@IsNotEmpty()
	@IsDefined()
	toPrivate: boolean;
}
