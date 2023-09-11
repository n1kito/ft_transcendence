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
	}

	handleDisconnect(client: Socket) {
		console.log('🔴 Client disconnected:', client.id);
	}

	@SubscribeMessage('onlineStatusConfirmation')
	handleMessage(
		client: any,
		payload: any,
	): { event: string; data: { message: string } } {
		console.log('Client wants to communicate');
		return {
			event: 'onlineStatusResponse',
			data: { message: 'Hey gorgeous ! 😘' },
		};
	}
}
