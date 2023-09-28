import { Module } from '@nestjs/common';
import { chatWebSocketGateway } from './chatWebSocket.gateway';

@Module({
  providers: [chatWebSocketGateway]
})
export class ConnectionStatusModule {}
