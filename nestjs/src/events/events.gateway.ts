import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface IOnlineStatusData {
	onlineStatus: boolean;
}

interface IOnlineStatusConfirmationData {
	message: string;
	timestamp?: Date;
}

@WebSocketGateway({
	path: '/ws/',
})
export class EventsGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	afterInit(server: any) {
		console.log('WebSocket initialized ✨');
	}

	handleConnection(client: Socket, ...args: any[]) {
		// TODO: mark user as online
		const userId = client.handshake.query.userId;
		console.log(
			`\nUser with ID ${userId} connected with socket id: ${client.id}\n`,
		);
	}

	handleDisconnect(client: any) {
		// TODO: mark user as offline
		//
	}

	// TODO: define the message body type ?
	// error handling with try/catch
	// add authentification
	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: any,
		@ConnectedSocket() client: Socket,
	): void {
		console.log('💬 Received message from client:', data);
		client.emit('message', 'Message received !');
	}

	@SubscribeMessage('onlineStatusUpdate')
	handleStatusUpdate(
		@MessageBody() data: IOnlineStatusData,
		@ConnectedSocket() client: Socket,
	): void {
		console.log('Server received online status: ', data);
		const response: IOnlineStatusConfirmationData = {
			message: `Thank you for updating your status to ${
				data.onlineStatus ? 'online' : 'offline'
			}`,
			timestamp: new Date(),
		};
		client.emit('onlineStatusConfirmation', response);
	}
}
