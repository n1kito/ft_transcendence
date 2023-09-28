import {
	IsNumberString,
	IsString,
	Length,
	MinLength,
	isBoolean,
} from 'class-validator';

export class twoFactorAuthenticationCodeDto {
	@IsString()
	@IsNumberString()
	@Length(6, 6)
	readonly twoFactorAuthenticationCode: string;
}
