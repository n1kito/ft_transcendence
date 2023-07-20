import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthMiddleWare } from 'src/middleware/auth.middleware';

@Module({
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule implements NestModule {
	// This `configure` method is part of the `NestModule` interface and will be called by NestJS when the application starts.
	configure(consumer: MiddlewareConsumer) {
		// Here, we are taking the `consumer` object provided by NestJS...
		consumer
			// ...and calling the `apply` method on it to apply our `AuthMiddleware`...
			.apply(AuthMiddleWare)
			// ...to all routes handled by `UserController`.
			.forRoutes(UserController);
	}
}
