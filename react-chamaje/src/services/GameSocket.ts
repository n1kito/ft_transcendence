import { error } from 'console';
import { io } from 'socket.io-client';

export class GameSocket {
	private connectionSocket;
	private userId: number;
	private accessToken: string;
	private currentGameRoomId: number;

	constructor(userId: number, accessToken: string) {
		// Initialize variables
		this.userId = userId;
		this.accessToken = accessToken;
		this.currentGameRoomId = -1;

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

	disconnect() {
		this.connectionSocket.disconnect();
	}

	handleMessage(data: { message: string }) {
		console.log('Server says:', data.message);
	}

	// setupGameRoomLogic() {
	// 	this.connectionSocket.on('assignedGameRoom', (data) => )
	// }

	findGameRoom(opponentId?: number) {
		if (opponentId) findRoomForTWo(opponentId);
		else this.findSoloGameRoom();
	}

	findSoloGameRoom(): Promise<number> {
		console.log('Trying to find a new game room...');
		return new Promise((resolve, reject) => {
			this.connectionSocket.emit('requestSoloGameRoom', {
				userId: this.userId,
			});

			// Set up a one-time listener for the response
			this.connectionSocket.once('assignedGameRoom', (data) => {
				if (data && data.gameRoomId) {
					resolve(data.gameRoomId);
					this.currentGameRoomId = data.gameRoomId;
				} else {
					reject(new Error('Invalid room assignment data received.'));
				}
			});

			// Optional: if there is no response from the server after 5 seconds,
			// send reject the promise with an error message
			setTimeout(() => {
				reject(new Error('Room assignment request timed out.'));
			}, 5000);
		});
	}

	getCurrentGameRoomId(): number {
		return this.currentGameRoomId;
	}

	// The room ID is stored in the instance of the gamesocket
	joinRoom() {
		console.log('GameSocket joinRoom()');
		this.connectionSocket.emit('join room', {
			userId: this.userId,
			roomId: this.currentGameRoomId,
		});
		this.connectionSocket.on('room error', (errorMessage) => {
			console.error(`Could not join room: ${errorMessage}`);
		});
		this.connectionSocket.on('user joined room', (userInfo) => {
			console.log(`${userInfo.user.login} joined the room !`);
		});
	}
}
