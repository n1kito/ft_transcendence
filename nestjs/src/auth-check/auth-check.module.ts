import { Module } from '@nestjs/common';
import { AuthCheckService } from './auth-check.service';
import { AuthCheckController } from './auth-check.controller';

@Module({
	controllers: [AuthCheckController],
	providers: [AuthCheckService],
})
export class AuthCheckModule {}
