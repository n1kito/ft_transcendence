import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Module({
	controllers: [NotificationsGateway],
	providers: [NotificationsGateway],
})
export class NotificationsGatewayModule {}
