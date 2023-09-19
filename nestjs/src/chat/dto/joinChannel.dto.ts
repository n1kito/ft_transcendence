import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	NotContains,
} from 'class-validator';

export class JoinChannelDTO {
	// TODO: do I need to escape more characters? (add '!' ?)
	@IsOptional()
	@IsNotEmpty()
	@IsString()
	@NotContains('/')
	@NotContains('\\')
    @NotContains(';')
	name?: string;
}
