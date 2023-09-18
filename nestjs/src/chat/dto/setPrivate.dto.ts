import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	NotContains,
} from 'class-validator';

export class SetPrivateDTO {
	@IsNumber()
	@IsNotEmpty()
	chatId: number;

	@IsBoolean()
	@IsNotEmpty()
	toPrivate: boolean;
}
