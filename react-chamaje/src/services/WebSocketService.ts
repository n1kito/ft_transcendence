import { Socket, io } from 'socket.io-client';
import { AuthContext } from 'src/contexts/AuthContext';
import useAuth from 'src/hooks/userAuth';

interface callbackInterface {
	(data: any): void;
}
class WebSocketService {
	private socket: Socket;
	private userId: number;

	constructor(accessToken: string, userId: number) {
		this.userId = userId;
		this.socket = io({
			path: '/ws/',
			reconnection: false,
			auth: { accessToken },
		});
		try {
			// Listen for the 'connect' event
			this.socket.on('connect', () => {
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

	sendServerConnection() {
		try {
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
}
export default WebSocketService;
