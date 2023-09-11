import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { ChatController } from './chat.controller';
import { TokenModule } from 'src/token/token.module';

@Module({
	controllers: [ChatController],
	providers: [ChatService, PrismaService],
	imports: [TokenModule],
})
export class ChatModule {}
