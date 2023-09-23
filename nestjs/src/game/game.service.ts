import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { randomBytes } from 'crypto';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameLogic } from './GameEntities/ServerGameLogic';
import { IPlayerInformation } from 'shared-lib/types/game';
import { resolvePtr } from 'dns';
// import { IPlayerInformation } from '@types/game-types';

function decodeToken(client: Socket): any {
	return jwt.verify(
		client.handshake.auth.accessToken,
		process.env.JWT_SECRET_KEY,
	) as jwt.JwtPayload;
}

// These are all the information that our users need to receive from the server
// to update their front correctly
interface PlayerGameState {
	y: number;
	opponentY: number;
	ballX: number;
	ballY: number;
	ballDX: number;
	ballDY: number;
	score: number;
	opponentScore: number;
	gameOver: boolean;
}

// This is everything that a room contains: a game instance, and players.
// So now, everytimg a
interface Room {
	gameInstance?: GameLogic;
	players: {
		[socketId: string]: PlayerGameState;
	};
}

// This is a map of all of our current rooms
interface Rooms {
	[roomId: string]: Room;
}

interface Client {
	userId: number;
	roomId?: string;
}

@Injectable()
export class GameService {
	private server: Server;

	private connectedClients: Map<string, Client> = new Map();
	private rooms: Rooms = {};

	private isProcessingRooms: Boolean = false;

	constructor(private readonly prisma: PrismaService) {}

	setServer(server: Server) {
		this.server = server;
	}

	/*
	░█▀▀░█▀█░█▀█░█▀█░█▀▀░█▀▀░▀█▀░▀█▀░█▀█░█▀█░
	░█░░░█░█░█░█░█░█░█▀▀░█░░░░█░░░█░░█░█░█░█░
	░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░
	*/

	handleNewClientConnection(newlyConnectedSocket: Socket) {
		try {
			// Handle client identification
			const decodedPayload = decodeToken(newlyConnectedSocket);
			const newlyConnectedUserId: number = decodedPayload.userId;
			const newlyConnectedSocketId: string = newlyConnectedSocket.id;
			console.log(
				`[🎉] Client token verified for user ${newlyConnectedUserId}!`,
			);
			newlyConnectedSocket.emit('identification_ok');

			// TODO: Do we want to do this ? Let's keep it for later
			// TODO: If we allow our user to join different rooms, we just
			// need to make sure they're not being added to a room they are
			// already in. This would be handled by assignRoom()

			// // Look for the user in the list of connected clients
			// if (this.isUserAlreadyConnected(userId)) {
			// 	console.log(
			// 		`[❗] User #${userId} is already connected, disconnecting them.`,
			// 	);
			// 	socket.emit('connection_limit_reached');
			// 	throw new Error('user reached max connections');
			// }

			// Add our client to the list of connected client
			this.connectedClients.set(newlyConnectedSocket.id, {
				userId: newlyConnectedUserId,
			});

			// Assign a room to our client
			const assignedRoomId = this.assignRoom(
				newlyConnectedSocketId,
				newlyConnectedUserId,
			);

			// If our client's room is now full, send each user their opponent's
			// information and instantiate a game instance
			if (this.isRoomFull(assignedRoomId)) {
				console.log(
					'[🏠] Room is FULL. Sending players their opponent information',
				);
				this.sharePlayersInfo(
					newlyConnectedSocketId,
					newlyConnectedUserId,
					assignedRoomId,
				);
				this.createGameLogic(assignedRoomId);
				// this.server.in(assignedRoomId).emit('room-is-full');
				// TODO: Regarding the gameSession, I think for now it should only be
				// created when the match had started
			}
		} catch (error) {
			console.error('Connection error: ', error.message);
			newlyConnectedSocket.disconnect();
		}
	}

	handleClientDisconnect(socket: Socket) {
		console.log(
			'[🔴] Client disconnected from socket %s',
			this.connectedClients.get(socket.id).userId,
			socket.id,
		);

		// Remove the client from their current room
		const currentRoomId = this.connectedClients.get(socket.id)?.roomId;
		if (currentRoomId && this.rooms[currentRoomId]) {
			// TODO: if a client leaves and they were in a game, we need to
			// stop the game broadcast, end the match etc...
			// handleGameStop(); // TODO:
			// Delete the client from the room
			delete this.rooms[currentRoomId].players[socket.id];
			console.log(`[🏠] Removing [%s] from room %s`, socket.id, currentRoomId);

			// If the room has no players left, delete the room itself
			if (Object.keys(this.rooms[currentRoomId].players).length === 0) {
				console.log(`[🏠] Room ${currentRoomId} was empty, removing it !`);
				delete this.rooms[currentRoomId];
			}
		}

		// Remove the client from the connectedClients map
		this.connectedClients.delete(socket.id);
	}

	/*
	░█▀▀░█▀█░█▄█░█▀▀
	░█░█░█▀█░█░█░█▀▀
	░▀▀▀░▀░▀░▀░▀░▀▀▀
	*/

	handlePlayerMovement(
		clientSocket: Socket,
		direction: 'up' | 'down' | 'immobile',
		inputSequenceId: number,
	) {
		// console.log('[🕹️ ] Player moved', direction);
		const playerRoomId = this.getRoomIdFromSocketId(clientSocket.id);
		if (!playerRoomId) return; // TODO: do something else here ?
		// TODO: Basically we need to feed this to the current came logic in the room
		// and then we'll want to extract a new game state to share with each player
		this.rooms[playerRoomId].gameInstance.setPlayerDirection(
			clientSocket.id,
			direction,
			inputSequenceId,
		);
	}

	createGameLogic(roomId: string) {
		const [player1SocketId, player2SocketId] = Object.keys(
			this.rooms[roomId].players,
		);
		console.log(
			`[🏠] Instantiating a game logic for players [${player1SocketId}] & [${player2SocketId}] in room #${roomId} `,
		);
		this.rooms[roomId].gameInstance = new GameLogic(
			player1SocketId,
			player2SocketId,
			this.server,
		);
	}

	/*
	░█▀▄░█▀█░█▀█░█▄█░█▀▀
	░█▀▄░█░█░█░█░█░█░▀▀█
	░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀
	*/

	// Find a room for our user
	// TODO: when the invites will be implemented, this should become assignSoloRoom
	// and we'll need findOpponentRoom() that looks for a room with me and my required
	// opponent and if not found creates it and puts us both inside.
	assignRoom(
		newlyConnectedSocketId: string,
		newlyConnectedUserId: number,
	): string {
		// TODO: this should be a mutex not an infinite loop, because otherwise
		// it will make the entire server lag everytime someone is assigned a room
		// // If the server is already processing rooms, wait so we don't create
		// // race conditions
		while (this.isProcessingRooms) {
			console.log(
				'[🏠] Waiting for the room assignment process to be unlocked !',
			);
		}

		// If not, lock it
		this.isProcessingRooms = true;

		// Find an available room or create a new one
		let targetRoomId: string | undefined;

		// Find a room that only has one player who is not our player
		for (const roomId in this.rooms) {
			if (Object.keys(this.rooms[roomId].players).length == 1) {
				// TODO: this was commented out for testing purposes
				// PUT IS BACK !!!!
				/*
				// Get the socketId of the player in the room
				const playerSocketId = Object.keys(this.rooms[roomId].players)[0];
				// Check if the userId associated to that socket is different from
				// the userId of the user we're trying to put in a room
				// If so, assign them to that room and stop looking
				if (this.connectedClients.get(playerSocketId).userId !== userId) {
				*/
				targetRoomId = roomId;
				break;
				// }
			}
		}

		// If there is no available room, create a new one
		if (!targetRoomId) {
			targetRoomId = this.generateRoomId(newlyConnectedUserId);
			this.rooms[targetRoomId] = {
				// gameLogic: new GameLogic(), // TODO: this should only be instantiated once there are two players in the room
				players: {},
			};
		}

		// Add the player to the room, and initialise their game state
		// TODO: this game state is not used anwywhere actually because it's not accessible by the game logic.
		this.rooms[targetRoomId].players[newlyConnectedSocketId] = {
			y: 0,
			opponentY: 0,
			ballX: 0,
			ballY: 0,
			ballDX: 0,
			ballDY: 0,
			score: 0,
			opponentScore: 0,
			gameOver: false,
		};

		// Update the roomId to our client's entry in the connectedClients map
		if (this.connectedClients.has(newlyConnectedSocketId))
			this.connectedClients.get(newlyConnectedSocketId).roomId = targetRoomId;

		console.log(
			`[🏠] user #${newlyConnectedUserId} via socket [${newlyConnectedSocketId}] was assigned to room #${targetRoomId}`,
		);

		// Unlock room processing lock, otherwise nothing else can happen
		this.isProcessingRooms = false;

		return targetRoomId;
	}

	generateRoomId(newlyConnectedUserId: number): string {
		let roomId: string;
		// Create new random roomIds as long as they already exist in the rooms list
		do {
			roomId = `${newlyConnectedUserId}-room-${randomBytes(5).toString('hex')}`;
		} while (this.rooms[roomId]);
		return roomId;
	}

	isRoomFull(roomId: string): boolean {
		return Object.keys(this.rooms[roomId].players).length === 2;
	}

	sharePlayersInfo(
		newlyConnectedSocketId: string,
		newlyConnectedUserid: number,
		assignedRoomId: string,
	) {
		// Find the socketId of the user's opponent
		const opponentSocketId = Object.keys(
			this.rooms[assignedRoomId].players,
		).find((currentSocketId) => currentSocketId !== newlyConnectedSocketId);
		// Get the userId associated with that socket
		const opponentUserId = this.connectedClients.get(opponentSocketId).userId;

		// Retrieve each player's information and send it to their opponent via
		// their socket

		// Retrieving and sharing newly connected user's information with opponent
		this.prisma.user
			.findUnique({
				where: {
					id: newlyConnectedUserid,
				},
				select: {
					login: true,
					image: true,
				},
			})
			.then((userInformation: IPlayerInformation) => {
				console.log(
					`This is the information of socket [${newlyConnectedSocketId}] user #${newlyConnectedUserid}: `,
					userInformation,
				);
				this.server.to(opponentSocketId).emit('opponent-info', userInformation);
			});
		// Retrieving and sharing opponent's information with newly connected user
		this.prisma.user
			.findUnique({
				where: {
					id: opponentUserId,
				},
				select: {
					login: true,
					image: true,
				},
			})
			.then((opponentInformation: IPlayerInformation) => {
				console.log(
					`This is the information of socket [${newlyConnectedSocketId}]'s opponent, user #${opponentUserId}: `,
					opponentInformation,
				);
				this.server
					.to(newlyConnectedSocketId)
					.emit('opponent-info', opponentInformation);
			});
	}

	// Let the user's roommate know they are ready
	broadcastPlayerIsReady(socket: Socket) {
		// Find the room they're currently in
		const playerRoomId = this.connectedClients.get(socket.id).roomId;
		// Find their current opponent
		const opponentSocketId = Object.keys(this.rooms[playerRoomId].players).find(
			(currentSocketId) => currentSocketId != socket.id,
		);
		// If they are still here, let them know that their opponent is ready
		if (opponentSocketId)
			this.server.to(opponentSocketId).emit('opponent-is-ready');
	}

	setPlayerAsReady(socket: Socket) {
		const playerRoomId = this.getRoomIdFromSocketId(socket.id);
		if (!playerRoomId) return; //TODO: do something better here ?

		// Use the game instance to set the player as ready
		const gameInstance = this.rooms[playerRoomId].gameInstance;
		gameInstance.setPlayerAsReady(socket.id);

		// If both players are ready, let both of them know and start the game
		if (this.rooms[playerRoomId].gameInstance.bothPlayersAreReady()) {
			// const [player1SocketId, player2SocketId] = Object.keys(
			// 	this.rooms[playerRoomId].players,
			// );
			// TODO: removed this because starting the game starts emitting update
			// to the clients and I'd rather use that to let the client know to start the game
			// this.server.to(player1SocketId).emit('game-has-started');
			// this.server.to(player2SocketId).emit('game-has-started');
			gameInstance.startGame();
			this.createDBGameEntry();
			// TODO: the game will start here so we need to create a DB entry for the game with each player
			// and if one disconnects, they are marked as a looser ?
		}
	}

	// Locate a room the user might be in
	getRoomIdFromSocketId(socketId: string): string | undefined {
		return this.connectedClients.get(socketId).roomId;
	}

	// TODO: opponent left the room, should handle several cases:
	// 1 - the game hasn't started, the player's opponent info should be reset and their ready
	// state should be reset as well
	// 2 - the game has started, it's marked as finished and recorded in the DB

	/*
	░█░█░▀█▀░▀█▀░█░░░█▀▀
	░█░█░░█░░░█░░█░░░▀▀█
	░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀
	*/

	/*
	░█▀▄░█▀█░▀█▀░█▀█░█▀▄░█▀█░█▀▀░█▀▀
	░█░█░█▀█░░█░░█▀█░█▀▄░█▀█░▀▀█░█▀▀
	░▀▀░░▀░▀░░▀░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀
	*/

	// TODO: how do I track what gameSession is linked to a particular game ? Maybe through the gameInstance ?
	createDBGameEntry() {

	}
}
