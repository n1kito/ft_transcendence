import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class NotificationsGateway implements OnGatewayInit {
	@WebSocketServer()
	server: Server;

	afterInit(server: any) {
		console.log('websocket gateway initialized');
	}

	@SubscribeMessage('subscribeToNotification')
	async subscribeToNotifications(client: any, data: any) {
		console.log('data:', data);
		client.emit('notifications', 'You are now subscribed to notifications');
	}
}
