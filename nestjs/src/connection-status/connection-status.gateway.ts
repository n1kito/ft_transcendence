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

	// when a client connects to the server, the server emits to all connected
	// clients the login of this user
	// TODO: It should also verify the jwt of this user before emitting
	@SubscribeMessage('connectionToServer')
	handleConnectionToServer(
		@MessageBody() data: string,
	) : void {
		this.server.emit('userLoggedIn', data);
		console.log('\n🟢🟢' + data + ' just arrived!🟢🟢\n')
	}

	// when a client received a 'userLoggedIn' message, it sends back a 
	// response to make itself known to other clients
	// TODO: It should also verify the jwt of this user before emitting
	@SubscribeMessage('userLoggedInResponse')
	handleUserLoggedInResponse(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) : void {
		this.server.emit('userLoggedInResponse', data);
	}

	@SubscribeMessage('endedConnection')
	handleEndedConnection(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) : void {
		console.log('\n🔴🔴' + data + ' just left!🔴🔴\n')
	}
}
