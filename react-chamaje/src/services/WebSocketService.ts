import { Socket, io } from 'socket.io-client';

interface callbackInterface {
	(data: any): void;
}
interface callbackStatusInterface {
	(id: any, online: boolean, playing: boolean): void;
}

class WebSocketService {
	public socket: Socket;
	private userId: number;

	constructor(accessToken: string, userId: number) {
		this.userId = userId;
		this.socket = io({
			path: '/ws/chat/',
			reconnection: false,
			auth: { accessToken },
		});
		try {
			// Listen for the 'connect' event
			this.socket.on('connect', () => {
				this.sendServerConnection('online');
			});
			// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
			this.socket.on('disconnect', (reason) => {
				if (
					reason != 'io client disconnect' &&
					reason != 'io server disconnect'
				) {
					// the disconnection was initiated by the server, you need to reconnect manually
					this.socket.connect();
				} else {
					// this.endConnection(this.userId);
					this.socket.disconnect();
				}
			});
		} catch (e) {}
	}

	getSocket(): Socket {
		return this.socket;
	}

	/* ********************************************************************* */
	/* ************************** CONNECTED STATUS ************************* */
	/* ********************************************************************* */
	getSocketId(): string {
		return this.socket.id;
	}

	sendServerConnection(status: string) {
		try {
			//status
			const isonline = status === 'online' ? true : false;
			const isplaying = status === 'playing' ? true : false;

			this.socket.emit('ServerConnection', {
				userId: this.userId,
				online: isonline,
				playing: isplaying,
			});
		} catch (e) {}
	}

	onClientLogIn(callback: callbackStatusInterface) {
		this.socket.on(
			'ClientLogIn',
			(id: number, online: boolean, playing: boolean) => {
				callback(id, online, playing);
				this.socket.emit('ServerLogInResponse', {
					userId: this.userId,
					online: online,
					playing: playing,
				});
			},
		);
	}

	onClientLogInResponse(callback: callbackStatusInterface) {
		this.socket.on('ClientLogInResponse', callback);
	}

	endConnection() {
		this.socket.emit('ServerEndedConnection', this.userId);
	}

	onLogOut(callback: callbackInterface) {
		this.socket.on('ClientLogOut', callback);
	}

	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */

	joinRoom(chatId: number) {
		this.socket.emit('joinRoom', chatId);
	}

	leaveRoom(chatId: number) {
		this.socket.emit('leaveRoom', chatId);
	}

	sendMessage(
		message: string,
		chatId: number,
		login: string,
		avatar: string,
		isNotif?: string,
		target?: number,
		targetLogin?: string,
		channelInvitation?: string,
	) {
		this.socket.emit('sendMessage', {
			chatId: chatId,
			message: message,
			userId: this.userId,
			login: login,
			avatar: avatar,
			isNotif: isNotif || null,
			target: target || null,
			targetLogin: targetLogin || null,
			channelInvitation: channelInvitation || null,
		});
	}

	// used when on active chat
	onReceiveMessage(callback: callbackInterface) {
		this.socket.on('receiveMessage', callback);
	}

	// used when leaving active chat but staying in room
	offReceiveMessage(callback: callbackInterface) {
		this.socket.off('receiveMessage', callback);
	}

	/* ********************************************************************* */
	/* ******************************* ADMIN ******************************* */
	/* ********************************************************************* */
	kick(userId: number, chatId: number) {
		this.socket.emit('kick', {
			chatId: chatId,
			userId: userId,
		});
	}

	onKick(callback: callbackInterface) {
		this.socket.on('kick', callback);
	}

	offKick(callback: callbackInterface) {
		this.socket.off('kick', callback);
	}

	makeAdmin(userId: number, chatId: number) {
		this.socket.emit('makeAdmin', {
			chatId: chatId,
			userId: userId,
		});
	}

	onMakeAdmin(callback: callbackInterface) {
		this.socket.on('makeAdmin', callback);
	}

	offMakeAdmin(callback: callbackInterface) {
		this.socket.off('makeAdmin', callback);
	}

	/* ********************************************************************* */
	/* ******************************* GAME ******************************** */
	/* ********************************************************************* */

	sendAcceptInvite(inviterLogin: string, chatId: number) {
		this.socket.emit('acceptInvite', {
			inviterLogin: inviterLogin,
			chatId: chatId,
		});
	}

	onSendAcceptInvite(callback: callbackInterface) {
		this.socket.on('acceptInvite', callback);
	}

	offSendAcceptInvite(callback: callbackInterface) {
		this.socket.off('acceptInvite', callback);
	}

	sendDeclineInvite(inviterLogin: string, chatId: number) {
		this.socket.emit('declineInvite', {
			inviterLogin: inviterLogin,
			chatId: chatId,
		});
	}

	onsendDeclineInvite(callback: callbackInterface) {
		this.socket.on('declineInvite', callback);
	}

	offsendDeclineInvite(callback: callbackInterface) {
		this.socket.off('declineInvite', callback);
	}
}

export default WebSocketService;
