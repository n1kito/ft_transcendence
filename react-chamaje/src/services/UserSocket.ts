import { io } from 'socket.io-client';

interface IOnlineStatusData {
	onlineStatus: boolean;
}
interface IOnlineStatusConfirmationData {
	message: string;
	timestamp?: Date;
}

export class UserSocket {
	private connectionSocket;

	constructor(userId: number) {
		this.connectionSocket = io({
			path: '/ws/',
			query: {
				userId: 'petit biscuit',
			},
		});
		this.connectionSocket.on('connect', () => {
			console.log('Connected to server ! 🔌🟢 ');
		});
		this.connectionSocket.on('connect_error', (error) => {
			console.error('Connection Error:', error);
		});
		this.connectionSocket.on('connect_timeout', () => {
			console.error('Connection Timeout');
		});

		// Listen for onlineStatus events from the server
		this.connectionSocket.on(
			'onlineStatusConfirmation',
			this.handleStatusUpdateFromServer.bind(this),
		);
	}

	handleStatusUpdateFromServer(data: IOnlineStatusConfirmationData) {
		console.log(data.message);
	}

	updateOnlineStatus(userIsOnline: boolean) {
		this.connectionSocket.emit('onlineStatusUpdate', {
			onlineStatus: userIsOnline,
		});
	}

	killSocketConnection() {
		this.connectionSocket.disconnect();
	}
}
