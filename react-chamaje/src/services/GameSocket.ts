import { error } from 'console';
import React from 'react';
import { Socket, io } from 'socket.io-client';
import { IGameDataProps } from '../contexts/GameContext';

type ReactBooleanSeter = React.Dispatch<React.SetStateAction<boolean>>;
type ReactStringSeter = React.Dispatch<React.SetStateAction<string>>;

// interface IGameDataProps {
// 	gameRoomId: number;
// 	opponentId?: number;
// 	opponentLogin?: string;
// 	opponentImage?: string;
// }

export class GameSocket {
	// Variables
	private socket: Socket | undefined;
	private userId: number;
	private accessToken: string;

	// Setters
	// These will come from the Game component, and will help us update the
	// Game component with what the server says
	// private setPlayerInRoom: ReactBooleanSeter;
	// private setPlayer2Ready: ReactBooleanSeter;
	// private setGameCanStart: ReactBooleanSeter;
	// private setOpponentIsReconnecting: ReactBooleanSeter;
	// private setConnectedToServer: ReactBooleanSeter;
	// private setConnectionStatus: ReactStringSeter;
	// private setOpponentInfo: React.Dispatch<
	// 	React.SetStateAction<{ login: string; image: string } | undefined>
	// >;
	private gameData: IGameDataProps;
	private updateGameData: (updates: Partial<IGameDataProps>) => void;
	private resetGamedata: () => void;

	constructor(
		userId: number,
		accessToken: string,
		// setPlayerInRoom: ReactBooleanSeter,
		// player2ReadySeter: ReactBooleanSeter,
		// gameCanStartSeter: ReactBooleanSeter,
		// connectedToServerSeter: ReactBooleanSeter,
		// setConnectionStatus: ReactStringSeter,
		// setOpponentInfo: React.Dispatch<
		// 	React.SetStateAction<{ login: string; image: string } | undefined>
		// >,
		// setOpponentIsReconnecting: ReactBooleanSeter,
		gamedata: IGameDataProps,
		updateGamedata: (updates: Partial<IGameDataProps>) => void,
		resetGameData: () => void,
	) {
		// Initialize variables
		this.userId = userId;
		this.accessToken = accessToken;

		// Initialize setters
		this.gameData = gamedata;
		this.updateGameData = updateGamedata;
		this.resetGamedata = resetGameData;
		// this.setPlayerInRoom = setPlayerInRoom;
		// this.setPlayer2Ready = player2ReadySeter;
		// this.setGameCanStart = gameCanStartSeter;
		// this.setConnectedToServer = connectedToServerSeter;
		// this.setConnectionStatus = setConnectionStatus;
		// this.setOpponentInfo = setOpponentInfo;
		// this.setOpponentIsReconnecting = setOpponentIsReconnecting;
	}

	// Try to initiate a socket connection with the server
	initiateSocketConnection() {
		try {
			// Start socket connection
			this.socket = io({
				path: '/ws/',
				reconnection: false,
				auth: { accessToken: this.accessToken },
			});
			// if (!this.connectionSocket) return;
			this.socket.on('connect', () => {
				this.log('Connected to server ! 🔌🟢 ');
			});
			this.socket.on('identification_ok', () => {
				// Notify the game component that we are connected to the server
				this.updateGameData({ connectedToServer: true });
			});
			this.socket.on('connect_error', (error: Error) => {
				this.updateGameData({ connectionErrorStatus: 'Connection error' });
				// this.setConnectionStatus('Connection error');
			});
			this.socket.on('connect_timeout', () => {
				this.updateGameData({ connectionErrorStatus: 'Connection timeout' });
				// this.setConnectionStatus('Connection timeout');
			});
			this.socket.on('connection_limit_reached', () => {
				this.updateGameData({
					connectionErrorStatus:
						'Too many connections, please close some tabs and refresh !',
				});
				// this.setConnectionStatus(
				// 	'Too many connections, please close some tabs and refresh !',
				// );
			});
			// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
			this.socket.on('disconnect', (reason) => {
				if (
					reason != 'io client disconnect' &&
					reason != 'io server disconnect'
				) {
					// the disconnection was initiated by the server, you need to reconnect manually
					if (this.socket) this.socket.connect();
				} else {
					// this.endConnection(this.userId);
					if (this.socket) this.socket.disconnect();
				}
			});
		} catch (error) {
			this.updateGameData({
				connectionErrorStatus: 'Connection failed: ' + error,
			});
			// this.setConnectionStatus('Connection failed: ' + error);
			// Throw on error, so the parent component cannot try to interact
			// with the server if they are not connected to it
			throw new Error('Could not connect to server');
		}
	}

	// utility that logs with a custom label
	log(logContent: any) {
		console.log(
			`%c GameSocket %c ${logContent}`,
			'background: purple; color: pink',
			'',
		);
	}

	// // join a game room
	// joinGameRoom(opponentId?: number) {
	// 	this.log('Asking for a room...');
	// 	try {
	// 		// ask the server to assign us a room
	// 		this.socket?.emit('join-room', {
	// 			userId: this.userId,
	// 			opponentId: opponentId,
	// 		});
	// 		// if the server succeeds
	// 		// TODO: type the roomInfo so we know what to expect
	// 		// Maybe store all types in a separate file ?
	// 		this.socket?.on('room-joined', (roomInfo) => {
	// 			this.log(`Server put us in room ${roomInfo.id}.`);
	// 			// let the front know we have been assigned a room
	// 			this.updateGameData({ roomId: roomInfo.id });
	// 			// this.setPlayerInRoom(true);

	// 			// set the socket to monitor/receive opponent information
	// 			this.socket?.on(`room-is-full`, () => {
	// 				this.log('Got notified that the room is full');
	// 				this.updateGameData({ roomIsFull: true });
	// 				// this.socket?.emit('request-opponent-info', {
	// 				// 	userId: this.userId,
	// 				// 	roomId: this.gameData.roomId,
	// 				// });
	// 			});
	// 			// and request that information
	// 			this.socket?.on(
	// 				'server-opponent-info',
	// 				(opponentInfo: { login: string; image: string }) => {
	// 					this.log(`My opponent: ${JSON.stringify(opponentInfo, null, 2)}`);
	// 					this.log('Opponent information received');
	// 					this.updateGameData({ opponentInfo: opponentInfo });
	// 					// this.setOpponentInfo(opponentInfo);
	// 				},
	// 			);

	// 			// look out for when the opponent is ready
	// 			this.socket?.on('opponent-is-ready', () => {
	// 				this.updateGameData({ player2Ready: true });
	// 				// this.setPlayer2Ready(true);
	// 			});

	// 			// look out for when opponent might be temporarily disconnected
	// 			this.socket?.on('opponent-was-disconnected', () => {
	// 				this.log('Opponent was disconnected but might come back !');
	// 				this.updateGameData({
	// 					opponentIsReconnecting: true,
	// 					player2Ready: false,
	// 					gameIsPlaying: false,
	// 				});
	// 				// this.setPlayer2Ready(false);
	// 				// this.setOpponentIsReconnecting(true);
	// 			});

	// 			// look out for when opponent might be disconnected
	// 			this.socket?.on('opponent-left', () => {
	// 				this.log('Opponent left for good :(');
	// 				// Let the game know that there is no player 2
	// 				this.updateGameData({
	// 					opponentIsReconnecting: false,
	// 					opponentInfo: undefined,
	// 					gameIsPlaying: false,
	// 					player1Ready: false,
	// 					player2Ready: false,
	// 				});
	// 			});
	// 		});
	// 		// if there was an error joining a room
	// 		this.socket?.on('error-joining-room', () => {
	// 			this.log('error joining room');
	// 			throw new Error('error joining room');
	// 		});
	// 	} catch (error) {
	// 		this.updateGameData({
	// 			connectionErrorStatus: 'Could not join room: ' + error,
	// 		});
	// 		// this.setConnectionStatus('Could not join room: ' + error);
	// 	}
	// }

	// requestOpponentInfo() {
	// 	this.log(`Requesting opponent info for room: ${this.gameData.roomId}`);
	// 	this.socket?.emit('request-opponent-info', {
	// 		userId: this.userId,
	// 		roomId: this.gameData.roomId,
	// 	});
	// }

	notifyPlayer1Ready() {
		this.socket?.emit('player-is-ready', {
			roomId: this.gameData.roomId,
		});
	}

	disconnect() {
		this.socket?.disconnect();
	}

	// findGameRoom(opponentId?: number) {
	// 	if (opponentId) this.findRoomForTwo(opponentId);
	// 	else this.findSoloGameRoom();
	// }

	// findSoloGameRoom(): Promise<number> {
	// 	console.log('Trying to find a new game room...');
	// 	return new Promise((resolve, reject) => {
	// 		this.socket.emit('request solo game room', {
	// 			userId: this.userId,
	// 		});

	// 		// Set up a one-time listener for the response
	// 		this.socket.once('assigned game room', (data) => {
	// 			if (data && data.gameRoomId) {
	// 				resolve(data.gameRoomId);
	// 				this.currentGameRoomId = data.gameRoomId;
	// 			} else {
	// 				reject(new Error('Invalid room assignment data received.'));
	// 			}
	// 		});

	// 		// Catching possible errors when trying to get a room
	// 		this.socket.on('error assigning solo room', () => {
	// 			console.log('%cCould not assign a solo room', 'color:purple');
	// 		});

	// 		// Optional: if there is no response from the server after 5 seconds,
	// 		// send reject the promise with an error message
	// 		setTimeout(() => {
	// 			reject(new Error('Room assignment request timed out.'));
	// 		}, 5000);
	// 	});
	// }

	// findRoomForTwo(opponentId: number) {
	// 	// this.setPlayer2Ready(true);
	// }

	// getCurrentGameRoomId(): number {
	// 	return this.currentGameRoomId;
	// }

	// // The room ID is stored in the instance of the gamesocket
	// joinRoom() {
	// 	console.log('GameSocket joinRoom()');
	// 	this.socket.emit('join room', {
	// 		userId: this.userId,
	// 		roomId: this.currentGameRoomId,
	// 	});
	// 	this.socket.on('room error', (errorMessage) => {
	// 		console.error(`Could not join room: ${errorMessage}`);
	// 	});
	// 	this.socket.on('user joined room', (userInfo) => {
	// 		console.log(`%c${userInfo.user.login} joined the room !`, 'color:pink');
	// 	});
	// }

	// setPlayer1IsReady(status: boolean) {
	// 	this.setPlayer1Ready(true);
	// }
}
