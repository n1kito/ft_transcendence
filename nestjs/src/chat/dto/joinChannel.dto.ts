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

export class JoinChannelDTO {
	// TODO: do I need to escape more characters? (add '!' ?)
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@NotContains('/')
	@NotContains('\\')
	@MaxLength(35)
	@MinLength(2)
    @NotContains(';')
	@IsDefined()
	name?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@IsDefined()
	@NotContains('\\')
	@NotContains(';')
	@NotContains(' ')
	@MinLength(7)
	@MaxLength(60)
	password?: string;

}
