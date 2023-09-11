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
import { disconnect } from 'process';

function decodeToken(client: Socket): any {
	return jwt.verify(
		client.handshake.auth.accessToken,
		process.env.JWT_SECRET_KEY,
	) as jwt.JwtPayload;
}

@WebSocketGateway({ path: '/ws/' })
export class chatWebSocketGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	/* ********************************************************************* */
	/* ***************************** CONNECTION **************************** */
	/* ********************************************************************* */

	// initiate connection after validating acces token
	handleConnection(client: any, ...args: any[]) {
		try {
			decodeToken(client);
		} catch (e) {
			console.error('Verify token failed:', e);
			client.disconnect();
		}
	}

	// disconnect
	handleDisconnect(client: Socket): void {}

	@WebSocketServer()
	server: Server;

	// when a client connects to the server, the server emits to all connected
	// clients the login of this user
	@SubscribeMessage('ServerConnection')
	handleServerConnection(@MessageBody() data: number): void {
		this.server.emit('ClientLogIn', data);
		console.log('\n🟢🟢' + data + ' just arrived!🟢🟢\n');
	}

	// when a client received a 'userLoggedIn' message, it sends back a
	// response to make itself known to other clients
	@SubscribeMessage('ServerLogInResponse')
	handleServerLogInResponse(
		@MessageBody() data: number,
		@ConnectedSocket() client: Socket,
	): void {
		this.server.emit('ClientLogInResponse', data);
		console.log('🟢 ClientLogInResponse: ' + data);
	}

	@SubscribeMessage('ServerEndedConnection')
	handleServerEndedConnection(
		@MessageBody() data: number,
		@ConnectedSocket() client: Socket,
	): void {
		console.log('\n🔴🔴' + data + ' just left!🔴🔴\n');
		this.server.emit('ClientLogOut', data);
		client.disconnect();

		// client.disconnect();
	}

	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */
	@SubscribeMessage('joinRoom')
	handleJoinRoom(
		@MessageBody() roomId: number,
		@ConnectedSocket() client: Socket,
	): void {
		client.join(roomId.toString());
		console.log('🚪🚪🚪' + client.id + 'just entered room n.' + roomId);
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(
		@MessageBody() roomId: number,
		@ConnectedSocket() client: Socket,
	): void {
		client.leave(roomId.toString());
		console.log('🚪🚪🚪' + client.id + 'just left room n.' + roomId);
	}

	@SubscribeMessage('sendMessage')
	handleSendMessage(
		@MessageBody() roomId: string,
		@ConnectedSocket() client: Socket,
	): string {
		this.server.to(roomId.toString()).emit('receiveMessage', roomId)
		return roomId;
	}
}
