import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthCheckModule } from './auth-check/auth-check.module';
import { DatabaseSetupModule } from './services/database-setup/database-setup.module';
import { PrismaModule } from './services/prisma-service/prisma.module';
import { PrismaService } from './services/prisma-service/prisma.service';

@Module({
	imports: [
		AuthModule,
		UserModule,
		AuthCheckModule,
		DatabaseSetupModule,
		PrismaModule,
	],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule {}
