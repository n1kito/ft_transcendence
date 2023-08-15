import {
	ConnectedSocket,
	MessageBody,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: ['http://localhost:3001', 'http://localhost:8080'],
		credentials: true,
	},
})
export class EventsGateway implements OnGatewayInit {
	afterInit(server: any) {
		console.log('WebSocket initialized');
	}

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	): void {
		console.log('received message from client:', data);
		client.emit('message', 'Message received !');
	}
}
