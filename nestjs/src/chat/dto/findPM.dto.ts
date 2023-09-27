import {
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsOptional,
} from 'class-validator';

export class FindPMDTO {
	@IsOptional()
	@IsNotEmpty()
    @IsNumber()
	@IsDefined()
	secondUserId?: number;

}
