import {
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	MessageBody,
	ConnectedSocket,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

function decodeToken(client: Socket): any {
	return jwt.verify(client.handshake.auth.accessToken, process.env.JWT_SECRET_KEY) as jwt.JwtPayload
}

@WebSocketGateway({ path: '/ws/' })
export class ConnectionStatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	afterInit(server: any) {
		console.log('\nwebsocket opened 🚇\n');
	}
	
	handleConnection(client: any, ...args: any[]) {
		console.log(`\n🟢Client connected : ${client.id}🟢`);
		try {
			console.log(decodeToken(client));
		} catch (e) {
			console.error('Verify token failed:', e);
		}
	}
	
	handleDisconnect(client: Socket) : void {
		console.log('\n\n🔴handleDisconnect🔴\n\n')
		
	}
	
	@WebSocketServer()
	server: Server;
	userId: number;

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
		console.log('🟢 userLoggedInResponse: ' + data)

	}

	@SubscribeMessage('endedConnection')
	handleEndedConnection(
		@MessageBody() data: string,
		@ConnectedSocket() client: Socket,
	) : void {
		console.log('\n🔴🔴' + data + ' just left!🔴🔴\n')
		this.server.emit('onLogOut', data);
		client.disconnect();

		// client.disconnect();
	}



}
