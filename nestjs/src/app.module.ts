import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthCheckModule } from './auth-check/auth-check.module';
import { PrismaService } from 'prisma/prisma.service';
import { AppService } from './app.service';

@Module({
	imports: [AuthModule, UserModule, AuthCheckModule],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule {}
