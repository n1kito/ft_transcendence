import { Socket, io } from 'socket.io-client';
import { AuthContext } from 'src/contexts/AuthContext';
import useAuth from 'src/hooks/userAuth';

interface callbackInterface {
	(data: any): void;
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
				console.log('🟢 ', this.userId, ' just connected');
				this.sendServerConnection();
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
					console.log('🔴 disconnection');
					this.socket.disconnect();
				}
			});
		} catch (e) {
			console.error(e, ': WebSocketService Constructor');
		}
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

	sendServerConnection() {
		try {
			// console.log('🟢 ping server !');
			this.socket.emit('ServerConnection', this.userId);
		} catch (e) {
			console.error(e, ': WebSocketService sendServerConnection');
		}
	}

	onClientLogIn(callback: callbackInterface) {
		this.socket.on('ClientLogIn', (data: number) => {
			callback(data);
			this.socket.emit('ServerLogInResponse', this.userId);
		});
	}

	onClientLogInResponse(callback: callbackInterface) {
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
	// joinLobby() {
	// 	this.socket.emit('joinLobby');
	// 	console.log('🚪 Entering lobby')
	// }

	joinRoom(chatId: number) {
		this.socket.emit('joinRoom', chatId);
		console.log('🚪 Entering room n.', chatId);
	}

	leaveRoom(chatId: number) {
		this.socket.emit('leaveRoom', chatId);
		console.log('🚪 Leaving room n.', chatId);
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
		console.log('sending message to ' + chatId + ': ' + message);
	}

	// used when on active chat
	onReceiveMessage(callback: callbackInterface) {
		this.socket.on('receiveMessage', callback);
		console.log('message listener on');
	}

	// used when leaving active chat but staying in room
	offReceiveMessage(callback: callbackInterface) {
		this.socket.off('receiveMessage', callback);
		console.log('message listener off');
	}

	// replyToInvit(chatId: number, messageId: number, reply: boolean) {
	// 	this.socket.emit('replyToInvit', {
	// 		chatId: chatId,
	// 		messageId: messageId,
	// 		reply: reply,
	// 	});
	// 	console.log('reply');

	// }

	/* ********************************************************************* */
	/* ******************************* ADMIN ******************************* */
	/* ********************************************************************* */
	kick(userId: number, chatId: number) {
		this.socket.emit('kick', {
			chatId: chatId,
			userId: userId,
		});
		console.log('kicking user ' + userId + ' from chat ' + chatId);
	}

	onKick(callback: callbackInterface) {
		this.socket.on('kick', callback);
		console.log('kick listener on');
	}

	offKick(callback: callbackInterface) {
		this.socket.off('kick', callback);
		console.log('kick listener off');
	}

	makeAdmin(userId: number, chatId: number) {
		this.socket.emit('makeAdmin', {
			chatId: chatId,
			userId: userId,
		});
	}

	onMakeAdmin(callback: callbackInterface) {
		this.socket.on('makeAdmin', callback);
		console.log('makeAdmin listener on');
	}

	offMakeAdmin(callback: callbackInterface) {
		this.socket.off('makeAdmin', callback);
		console.log('makeAdmin listener off');
	}

	/* ********************************************************************* */
	/* ******************************* GAME ******************************** */
	/* ********************************************************************* */

	sendAcceptInvite(inviterLogin: string, chatId: number) {
		this.socket.emit('acceptInvite', {
			inviterLogin: inviterLogin,
			chatId: chatId,
		});
		console.log('sent invite accept to ' + inviterLogin);
	}

	onSendAcceptInvite(callback: callbackInterface) {
		this.socket.on('acceptInvite', callback);
		console.log('acceptInvite listener on');
	}

	offSendAcceptInvite(callback: callbackInterface) {
		this.socket.off('acceptInvite', callback);
		console.log('acceptInvite listener off');
	}

	sendDeclineInvite(inviterLogin: string, chatId: number) {
		this.socket.emit('declineInvite', {
			inviterLogin: inviterLogin,
			chatId: chatId,
		});
		console.log('sent invite decline to ' + inviterLogin);
	}

	onsendDeclineInvite(callback: callbackInterface) {
		this.socket.on('declineInvite', callback);
		console.log('declineInvite listener on');
	}

	offsendDeclineInvite(callback: callbackInterface) {
		this.socket.off('declineInvite', callback);
		console.log('declineInvite listener off');
	}
}

export default WebSocketService;
