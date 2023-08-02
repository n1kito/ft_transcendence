import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
	controllers: [TokenController],
	providers: [TokenService],
	exports: [TokenService],
})
export class TokenModule {}
