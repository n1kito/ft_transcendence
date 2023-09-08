import { Module } from '@nestjs/common';
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
import { GameModule } from './game/game.module';
import { GameService } from './game/game.service';

@Module({
	imports: [
		AuthModule,
		UserModule,
		AuthCheckModule,
		DatabaseSetupModule,
		PrismaModule,
		TokenModule,
		GameModule,
	],
	controllers: [AppController],
	providers: [AppService, PrismaService, GameService],
})
export class AppModule {}
