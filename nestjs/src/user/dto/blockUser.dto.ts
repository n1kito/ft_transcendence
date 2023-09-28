import {
	IsBoolean,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	NotContains,
} from 'class-validator';

export class BlockUserDTO {
	// TODO: do I need to escape more characters? (add '!' ?)
    @IsNotEmpty()
    @IsNumber()
    @IsDefined()
    userId: number
}
