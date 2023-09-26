import {
	MiddlewareConsumer,
	Module,
	NestModule,
	Options,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthCheckModule } from './auth-check/auth-check.module';
// import { PrismaService } from 'prisma/prisma.service';
import { AppService } from './app.service';
import { DatabaseSetupModule } from './services/database-setup/database-setup.module';
import { PrismaModule } from './services/prisma-service/prisma.module';
import { PrismaService } from './services/prisma-service/prisma.service';
import { TokenModule } from './token/token.module';
import { ConnectionStatusModule } from './connection-status/connection-status.module';
import { AuthMiddleWare } from './middleware/auth.middleware';
import { APP_GUARD } from '@nestjs/core';
import {
	ThrottlerGuard,
	ThrottlerModule,
	ThrottlerModuleOptions,
} from '@nestjs/throttler';

@Module({
	imports: [
		AuthModule,
		UserModule,
		AuthCheckModule,
		DatabaseSetupModule,
		PrismaModule,
		TokenModule,
		ConnectionStatusModule,
	],
	controllers: [AppController],
	providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleWare).forRoutes('*');
	}
}
