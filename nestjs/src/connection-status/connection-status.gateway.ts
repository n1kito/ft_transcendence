import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
	OnGatewayInit,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ path: '/ws/' })
export class ConnectionStatusGateway implements OnGatewayInit, OnGatewayConnection {
	afterInit(server: any) {
		console.log('\nwebsocket opened 🚇\n');
	}

	handleConnection(client: any, ...args: any[]) {
		console.log(`\n🟢Client connected : ${client.id}🟢`)
	}
	@WebSocketServer()
	server: Server;

	@SubscribeMessage('message')
	handleMessage(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	): void {
		console.log('\n🟢🟢' + data + '🟢🟢\n');
		client.emit('response', 'hi from nest');
	}

	@SubscribeMessage('startedConnection')
	handleStartedConnection(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) : void {
		this.server.emit('startedConnection', data);
		console.log('\n🟢🟢' + data + ' just arrived!🟢🟢\n')
	}

	@SubscribeMessage('endedConnection')
	handleEndedConnection(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) : void {
		console.log('\n🔴🔴' + data + ' just left!🔴🔴\n')
	}
}
