import { io } from 'socket.io-client';

export class GameSocket {
	private connectionSocket;

	constructor(userId: number) {
		// Start socket connection
		this.connectionSocket = io({
			path: '/ws/',
			query: {
				userId: userId,
			},
		});
		this.connectionSocket.on('connect', () => {
			console.log('Connected to server ! 🔌🟢 ');
			this.connectionSocket.emit('onlineStatusConfirmation', {});
		});
		this.connectionSocket.on('connect_error', (error: Error) => {
			console.error('Connection Error:', error);
		});
		this.connectionSocket.on('connect_timeout', () => {
			console.error('Connection Timeout');
		});

		// Listen for messages events from the server
		this.connectionSocket.on(
			'onlineStatusResponse',
			this.handleMessage.bind(this),
		);
	}

	handleMessage(data: { message: string }) {
		console.log('Server says:', data.message);
	}
}
