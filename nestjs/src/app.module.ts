import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthCheckModule } from './auth-check/auth-check.module';

@Module({
	imports: [AuthModule, UserModule, AuthCheckModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
