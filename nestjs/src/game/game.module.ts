import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GameController } from './game.controller';
import { UserService } from 'src/user/user.service';
import { AuthMiddleWare } from 'src/middleware/auth.middleware';
import { GameService } from './game.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { TokenModule } from 'src/token/token.module';
import { GameGateway } from './game.gateway';
import AuthService from 'src/auth/auth.service';

@Module({
	imports: [TokenModule],
	controllers: [GameController],
	providers: [GameService, PrismaService, UserService, AuthService, GameGateway],
})
export class GameModule {}

// TODO: is this correct ? It's also in user module, is there a way to make that middleware
// applied to several modules at once?
// export class GameModule implements NestModule {
// 	// This `configure` method is part of the `NestModule` interface and will be called by NestJS when the application starts.
// 	configure(consumer: MiddlewareConsumer) {
// 		// Here, we are taking the `consumer` object provided by NestJS...
// 		consumer
// 			// ...and calling the `apply` method on it to apply our `AuthMiddleware`...
// 			.apply(AuthMiddleWare)
// 			// ...to all routes handled by `UserController`.
// 			.forRoutes(GameController);
// 	}
// }
