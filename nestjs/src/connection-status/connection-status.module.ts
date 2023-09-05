import { Module } from '@nestjs/common';
import { ConnectionStatusGateway } from './connection-status.gateway';

@Module({
  providers: [ConnectionStatusGateway]
})
export class ConnectionStatusModule {}
