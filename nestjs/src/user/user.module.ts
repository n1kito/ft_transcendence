import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthMiddleWare } from 'src/middleware/auth.middleware';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { ChatService } from 'src/chat/chat.service';

@Module({
	imports: [TokenModule],
	controllers: [UserController],
	providers: [UserService, PrismaService, ChatService],
})
export class UserModule {}
