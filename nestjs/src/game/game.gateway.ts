import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	WebSocketServer,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
	path: '/ws/',
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	afterInit(server: Server) {
		console.log('🦄 Server initialized !');
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log('🟢 Client connected: ', client.id);
		// this.server.emit('message', 'You little cunt');
	}

	handleDisconnect(client: Socket) {
		console.log('🔴 Client disconnected:', client.id);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string {
		console.log('🔫 Received a message');
		return 'Hello world!';
	}
}
