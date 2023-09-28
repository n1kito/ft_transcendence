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
    @IsNotEmpty()
    @IsNumber()
    @IsDefined()
    userId: number
}
