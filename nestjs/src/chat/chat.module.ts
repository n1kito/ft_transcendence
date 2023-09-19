import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { ChatController } from './chat.controller';
import { TokenModule } from 'src/token/token.module';
import { AuthMiddleWare } from 'src/middleware/auth.middleware';

@Module({
	controllers: [ChatController],
	providers: [ChatService, PrismaService],
	imports: [TokenModule],
})
export class ChatModule implements NestModule {
	// This `configure` method is part of the `NestModule` interface and will be called by NestJS when the application starts.
	configure(consumer: MiddlewareConsumer) {
		// Here, we are taking the `consumer` object provided by NestJS...
		consumer
			// ...and calling the `apply` method on it to apply our `AuthMiddleware`...
			.apply(AuthMiddleWare)
			// ...to all routes handled by `UserController`.
			.forRoutes(ChatController);
	}
}