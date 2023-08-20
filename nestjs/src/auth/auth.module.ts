import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	imports: [TokenModule],
})
export class AuthModule {}
