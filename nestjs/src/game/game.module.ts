import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { GameGateway } from './game.gateway';
import AuthService from 'src/auth/auth.service';
import { TokenService } from 'src/token/token.service';

@Module({
	imports: [TokenModule],
	providers: [
		PrismaService,
		UserService,
		AuthService,
		GameGateway,
		GameService,
		TokenService,
	],
})
export class GameModule {}