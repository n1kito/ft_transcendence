import {
	IsAlphanumeric,
	IsNotEmpty,
	IsNumber,
	IsString,
    NotContains,
} from 'class-validator';

export class SetPasswordDTO {
    @NotContains("\\")
    @NotContains("/")
    @NotContains(";")
	@IsString()
	newPassword: string;

	@IsNumber()
	@IsNotEmpty()
	chatId: number;
}
