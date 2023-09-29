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

interface ICommunication {
	chatId: number;
	message: string;
	userId: number;
	login: string;
	avatar: string;
	isNotif?: string;
	target?: number;
	channelInvitation?: string;
	targetLogin?: string;
}

interface IStatus {
	userId: number;
	online: boolean;
	playing: boolean;
}

interface IGameInvit {
	inviterLogin: string;
	chatId: number;
}

export interface IMessage {
	chatId: number;
	sentById: number;
	sentAt: Date;
	content: string;
	login: string;
	avatar?: string;
	isNotif?: string;
	target?: number;
	channelInvitation?: string;
	targetLogin?: string;
}

export interface IUserAction {
	chatId: number;
	userId: number;
}

@WebSocketGateway({ path: '/ws/chat' })
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
	handleServerConnection(@MessageBody() content: IStatus): void {
		this.server.emit(
			'ClientLogIn',
			content.userId,
			content.online,
			content.playing,
		);
	}

	// when a client received a 'userLoggedIn' message, it sends back a
	// response to make itself known to other clients
	@SubscribeMessage('ServerLogInResponse')
	handleServerLogInResponse(
		@MessageBody() content: IStatus,
		@ConnectedSocket() client: Socket,
	): void {
		this.server.emit(
			'ClientLogInResponse',
			content.userId,
			content.online,
			content.playing,
		);
	}

	@SubscribeMessage('ServerEndedConnection')
	handleServerEndedConnection(
		@MessageBody() data: number,
		@ConnectedSocket() client: Socket,
	): void {
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
	}

	@SubscribeMessage('leaveRoom')
	handleLeaveRoom(
		@MessageBody() roomId: number,
		@ConnectedSocket() client: Socket,
	): void {
		client.leave(roomId.toString());
	}

	@SubscribeMessage('sendMessage')
	handleSendMessage(
		@MessageBody() content: ICommunication,
		@ConnectedSocket() client: Socket,
	): void {
		const messageToSend: IMessage = {
			chatId: content.chatId,
			sentById: content.userId,
			sentAt: new Date(),
			content: content.message,
			login: content.login,
			avatar: content.avatar,
			isNotif: content.isNotif || null,
			target: content.target || null,
			targetLogin: content.targetLogin || null,
			channelInvitation: content.channelInvitation || null,
		};
		// sends the message to everyone except the sender
		client.to(content.chatId.toString()).emit('receiveMessage', messageToSend);
	}

	// kick and ban
	@SubscribeMessage('kick')
	handleKick(
		@MessageBody() content: IUserAction,
		@ConnectedSocket() client: Socket,
	): void {
		const kickMessage: IUserAction = {
			chatId: content.chatId,
			userId: content.userId,
		};
		client.to(content.chatId.toString()).emit('kick', kickMessage);
	}

	@SubscribeMessage('makeAdmin')
	handleMakeAdmin(
		@MessageBody() content: IUserAction,
		@ConnectedSocket() client: Socket,
	): void {
		const message: IUserAction = {
			chatId: content.chatId,
			userId: content.userId,
		};
		client.to(content.chatId.toString()).emit('makeAdmin', message);
	}

	/* ********************************************************************* */
	/* ******************************** GAME ******************************* */
	/* ********************************************************************* */
	@SubscribeMessage('acceptInvite')
	handleAcceptInvite(
		@MessageBody() content: IGameInvit,
		@ConnectedSocket() client: Socket,
	): void {
		this.server.emit('acceptInvite', content);
	}

	@SubscribeMessage('declineInvite')
	handleDeclineInvite(
		@MessageBody() content: IGameInvit,
		@ConnectedSocket() client: Socket,
	): void {
		this.server.emit('declineInvite', content);
	}
}
