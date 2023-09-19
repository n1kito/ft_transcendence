import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { randomBytes } from 'crypto';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameLogic } from './GameEntities/GameLogic';

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
	gameLogic: GameLogic;
	players: {
		[socketId: string]: PlayerGameState;
	};
}

// This is a map of all of our current rooms
interface Rooms {
	[roomId: string]: Room;
}

interface Client {
	socketId: string;
	userId: number;
	roomId?: string;
}

@Injectable()
export class GameService {
	// // Declare a map of rooms that will store a room-ID and an array of players
	// private roomsMap: { [roomId: string]: number[] };
	// // We declare a map of user sockets, each key is a userId that will store
	// // all the sockets the user is using to talk to the server
	// private userSocketMap: { [userId: number]: string[] };
	// // This will log the socket along with its corresponding userId, so I
	// // can easily find who is connected to which socket
	// private socketUserMap: { [socket: string]: number };
	private server: Server;

	// private gameInstance: GameLogic;

	private connectedClients: Map<string, Client> = new Map();
	private rooms: Rooms = {};

	private isProcessingRooms: Boolean = false;

	constructor(
		private readonly prisma: PrismaService, // @Inject('IO_SERVER') private readonly server: Server,
	) {
		// this.roomsMap = {};
		// this.userSocketMap = {};
		// this.socketUserMap = {};
	}

	setServer(server: Server) {
		this.server = server;
	}

	/*
	░█▀▀░█▀█░█▀█░█▀█░█▀▀░█▀▀░▀█▀░▀█▀░█▀█░█▀█░
	░█░░░█░█░█░█░█░█░█▀▀░█░░░░█░░░█░░█░█░█░█░
	░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░
	*/

	handleNewClientConnection(socket: Socket) {
		try {
			// Handle client identification
			const decodedPayload = decodeToken(socket);
			const userId = decodedPayload.userId;
			const socketId = socket.id;
			console.log(`[🎉] Client token verified for user ${userId}!`);
			socket.emit('identification_ok');

			// TODO: Do we want to do this ? Let's keep if for later
			// // Look for the user in the list of connected clients
			// if (this.isUserAlreadyConnected(userId)) {
			// 	console.log(
			// 		`[❗] User #${userId} is already connected, disconnecting them.`,
			// 	);
			// 	socket.emit('connection_limit_reached');
			// 	throw new Error('user reached max connections');
			// }

			// Add our client to the list of connected client
			this.connectedClients.set(socket.id, { socketId, userId });

			// Assign a room to our client
			const assignedRoomId = this.assignRoom(socketId, userId);

			// If our client's room is now full, let the participants know
			// that they have an opponent
			if (this.isRoomFull(assignedRoomId)) {
				console.log(
					'[🛏] Room is FULL. Sending players their opponent information',
				);
				// TODO: this should actually just send them each other's information ?
				this.server.in(assignedRoomId).emit('room-is-full');
				// TODO: Regarding the gameSession, I think for now it should only be
				// created when the match is over, to store its information.
				// If it ended too soon or does not have a clear winner, it's not stored at all.
			}
		} catch (error) {
			console.error('Connection error: ', error.message);
			socket.disconnect();
		}
	}

	handleClientDisconnect(socket: Socket) {
		console.log(
			'[🔴] Client disconnected from socket %s',
			this.connectedClients.get(socket.id).userId,
			socket.id,
		);

		// Remove the client from the connectedClients map
		this.connectedClients.delete(socket.id);

		// Remove the client from their current room
		const currentRoomId = this.connectedClients.get(socket.id)?.roomId;
		if (currentRoomId && this.rooms[currentRoomId]) {
			delete this.rooms[currentRoomId].players[socket.id];
			console.log(`[🛏] Removing [%s] from room %s`, socket.id, currentRoomId);

			// If the room has no players left, delete the room itself
			if (Object.keys(this.rooms[currentRoomId].players).length === 0) {
				console.log(`[🛏] Room ${currentRoomId} was empty, removing it !`);
				delete this.rooms[currentRoomId];
			}
		}
	}

	// isUserAlreadyConnected(userId): boolean {

	// }

	// handleNewClientConnection(socket: Socket) {
	// 	console.log('[🟢] Client connected: ', socket.id);
	// 	try {
	// 		const decodedPayload = decodeToken(socket);
	// 		// Extract our userId from the payload,this.server.in(roomId).emit('room-is-full'); so we know who's connected
	// 		const userId = decodedPayload.userId;
	// 		console.log(`[🎉] Client token verified for user ${userId}!`);
	// 		socket.emit('identification_ok');
	// 		// Add the userId to our map along with they socket identifier
	// 		// This allows to to track all the sockets our user is using to
	// 		// play. If the user does not have an array yet, initialize one
	// 		if (!this.userSocketMap[userId]) {
	// 			this.userSocketMap[userId] = [];
	// 		}
	// 		// If our user is already connected, we reject the connection
	// 		else {
	// 			console.log(
	// 				`[❗] User #${userId} already has ${this.userSocketMap[userId].length} sockets in use, we say NO.`,
	// 			);
	// 			socket.emit('connection_limit_reached');
	// 			throw new Error('user reached max connections');
	// 		}
	// 		// Add the socket id to the array of sockets for the client
	// 		this.userSocketMap[userId].push(socket.id);
	// 		// Add the socket to the socketUserMap, along with the id of its owner
	// 		this.socketUserMap[socket.id] = userId;
	// 	} catch (error) {
	// 		console.error('Connection error: ', error.message);
	// 		socket.disconnect();
	// 	}
	// }

	// async handleDisconnect(socket: Socket) {
	// 	const socketOwnerId = this.findSocketOwner(socket.id);

	// 	console.log(
	// 		'[🔴] Client %s disconnected from socket %s',
	// 		socketOwnerId,
	// 		socket.id,
	// 	);

	// 	// If we found the socket owner
	// 	if (socketOwnerId) this.cleanupSocketMaps(socket, socketOwnerId);

	// 	// These are server only logs
	// 	if (Object.keys(this.socketUserMap).length > 0)
	// 		console.log(
	// 			'[📊] Here are the sockets we are still tracking: ',
	// 			this.socketUserMap,
	// 		);
	// 	if (Object.keys(this.userSocketMap).length > 0)
	// 		console.log(
	// 			'[📊] Here are the users still connected: ',
	// 			this.userSocketMap,
	// 		);
	// 	else console.log('[📊] There are no more users connected');

	// 	// Delete the rooms our user was alone in
	// 	this.deletePlayerSoloRooms(socketOwnerId);
	// 	// Notify their opponents that the user left
	// 	this.notifyCurrentOpponents(socketOwnerId, 'opponent-left');
	// 	// Remove the player from all the rooms they were in
	// 	this.removePlayerFromOpponentRooms(socketOwnerId);
	// 	// Clean-up non-played matches from the database
	// 	await this.DBCleanUpEmptyGameSessions();
	// }

	// async handlePlayerLeft(playerId: number) {
	// 	// Notify their opponents that they left for good
	// 	this.notifyCurrentOpponents(playerId, 'opponent-left');
	// 	// Remove player from their current rooms
	// 	this.removePlayerFromOpponentRooms(playerId);
	// 	// Remove the inactive game sessions that might have been created
	// 	await this.DBCleanUpEmptyGameSessions();
	// }

	/*
	░█▀▀░█▀█░█▄█░█▀▀
	░█░█░█▀█░█░█░█▀▀
	░▀▀▀░▀░▀░▀░▀░▀▀▀
	*/

	handlePlayerMovement(socketId: string, movement: string) {
		// Find out if it's player
	}

	/*
	░█▀▄░█▀█░█▀█░█▄█░█▀▀
	░█▀▄░█░█░█░█░█░█░▀▀█
	░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀
	*/

	assignRoom(socketId: string, userId: number): string {
		// If the server is already processing rooms, wait so we don't create
		// race conditions
		while (this.isProcessingRooms) {}

		// If not, lock it
		this.isProcessingRooms = true;

		// Find an available room or create a new one
		let targetRoomId: string | undefined;

		// Find a room that only has one player
		for (const roomId in this.rooms) {
			if (Object.keys(this.rooms[roomId].players).length == 1) {
				targetRoomId = roomId;
				break;
			}
		}

		// If there is no available room, create a new one
		if (!targetRoomId) {
			targetRoomId = this.generateRoomId(userId);
			this.rooms[targetRoomId] = {
				gameLogic: new GameLogic(),
				players: {},
			};
		}

		// Add the player to the room, and initialise their game state
		this.rooms[targetRoomId].players[socketId] = {
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
		if (this.connectedClients.has(socketId))
			this.connectedClients.get(socketId).roomId = targetRoomId;

		console.log(
			`[🛏] user #${userId} via socket [${socketId}] was assigned to room #${targetRoomId}`,
		);

		return targetRoomId;
	}

	generateRoomId(userId: number): string {
		let roomId: string;
		// Create new random roomIds as long as they already exist in the rooms list
		do {
			roomId = `${userId}-room-${randomBytes(5).toString('hex')}`;
		} while (this.rooms[roomId]);
		return roomId;
	}

	isRoomFull(roomId: string): boolean {
		return Object.keys(this.rooms[roomId].players).length === 2;
	}

	// handleJoinRoom(
	// 	socket: Socket,
	// 	userId: number,
	// 	opponentId: number | undefined,
	// ) {
	// 	try {
	// 		let roomId: string;

	// 		// if user knows they want to play against someone
	// 		if (opponentId) {
	// 		}
	// 		// otherwise, user just wants to play and should be assigned a room
	// 		else {
	// 			console.log(`[🏓] User ${userId} would like to be paired with someone`);
	// 			roomId = this.handleSoloRoomAssignment(userId);
	// 		}
	// 		// Add our player to the target socket room
	// 		socket.join(roomId);
	// 		// And let our user know they have joined that room
	// 		socket.emit('room-joined', {
	// 			id: roomId,
	// 		});
	// 		// if the room is full
	// 		if (this.isRoomFull(roomId)) {
	// 			// TODO: should this be done when room is full or when both users are ready ?
	// 			// What if the room is created but one of the players leaves before the match can even start?
	// 			// Create a db game entry with both users
	// 			this.DBCreateGameEntry(roomId).then(() => {
	// 				console.log(`[🏓] Notifying everyone that the current room is full`);
	// 				this.server.in(roomId).emit('room-is-full');
	// 			});
	// 		}
	// 	} catch (error) {
	// 		throw new Error(`handleJoinRoom(): ${error.message}`);
	// 	}
	// }

	// // The requesting user joins a game with no opponent in mind
	// // (meaning it's not from a chat invite)
	// handleSoloRoomAssignment(userId: number): string {
	// 	// Find a room the user might already be playing in
	// 	const roomUserIsAlreadyPlayingIn =
	// 		this.findRoomUserIsAlreadyPlayingIn(userId);
	// 	if (roomUserIsAlreadyPlayingIn) {
	// 		console.log(
	// 			`[🏓] User ${userId} was already playing in room #${roomUserIsAlreadyPlayingIn}`,
	// 		);
	// 		return roomUserIsAlreadyPlayingIn;
	// 	}
	// 	// Find a room with an opponent waiting for a partner
	// 	const roomWhereOpponentIsWaiting = this.findRoomWithOpponentWaiting(userId);
	// 	if (roomWhereOpponentIsWaiting) {
	// 		this.roomsMap[roomWhereOpponentIsWaiting].push(userId);
	// 		console.log(
	// 			`[🏓] Added user ${userId} to #${roomWhereOpponentIsWaiting}, where someone was waiting`,
	// 		);
	// 		return roomWhereOpponentIsWaiting;
	// 	}
	// 	// Find a room where our user is alone
	// 	const roomWithOnlyUser = this.findSoloRoom(userId);
	// 	if (roomWithOnlyUser) {
	// 		console.log(
	// 			`[🏓] Found room ${roomWithOnlyUser} where user ${userId} was alone.`,
	// 		);
	// 		return roomWithOnlyUser;
	// 	}
	// 	// Create a new room
	// 	const newRoom = this.createNewRoom(userId);
	// 	this.roomsMap[newRoom].push(userId);
	// 	// Return the room Id
	// 	return newRoom;
	// }

	// findRoomWithOpponentWaiting(userId: number): string | undefined {
	// 	const opponentRoomId: string | undefined = Object.keys(this.roomsMap).find(
	// 		(roomId) => {
	// 			// Retrieve the players in the room
	// 			const players = this.roomsMap[roomId];
	// 			// Returns whether there is only one player in it or not
	// 			// and if that player is not us
	// 			return players.length === 1 && players[0] != userId;
	// 		},
	// 	);
	// 	if (opponentRoomId)
	// 		console.log(
	// 			`[🏓] Found a room with someone waiting:`,
	// 			this.roomsMap[opponentRoomId],
	// 		);
	// 	else console.log(`[🏓] Found no room with someone waiting.`);
	// 	// If a room with an opponent is found, return its id, or return nothing
	// 	return opponentRoomId;
	// }

	// findSoloRoom(userId: number) {
	// 	const soloRoomId: string | undefined = Object.keys(this.roomsMap).find(
	// 		(roomId) => {
	// 			const players = this.roomsMap[roomId];
	// 			return players.length === 1 && players[0] === userId;
	// 		},
	// 	);
	// 	if (soloRoomId)
	// 		console.log(
	// 			`[🏓] Found a room user was alone in:`,
	// 			this.roomsMap[soloRoomId],
	// 		);
	// 	else console.log(`[🏓] Found no room user was solo in.`);
	// 	// If a solo room is found, return its id, or return nothing
	// 	return soloRoomId;
	// }

	// findRoomUserIsAlreadyPlayingIn(userId: number): string | undefined {
	// 	const currentRoom: string | undefined = Object.keys(this.roomsMap).find(
	// 		(roomId) => {
	// 			// Retrieve the players in the room
	// 			const players = this.roomsMap[roomId];
	// 			// Returns whether there is only one player in it or not
	// 			// and if that player is not us
	// 			return (
	// 				players.length === 2 && (players[0] == userId || players[1] == userId)
	// 			);
	// 		},
	// 	);
	// 	if (currentRoom)
	// 		console.log(
	// 			`[🏓] Found a room user was already playing in:`,
	// 			this.roomsMap[currentRoom],
	// 		);
	// 	else console.log(`[🏓] Found no room user was already playing in.`);
	// 	// If a room with an opponent is found, return its id, or return nothing
	// 	return currentRoom;
	// }

	// createNewRoom(userId: number): string {
	// 	let roomId;
	// 	do {
	// 		roomId = `${userId}-room-${randomBytes(5).toString('hex')}`;
	// 	} while (this.roomsMap[roomId]);
	// 	// Create the entry in the map
	// 	this.roomsMap[roomId] = [];
	// 	console.log(`[🏓] User ${userId} created room ${roomId}`);
	// 	return roomId;
	// }

	// isRoomFull(roomId: string): boolean {
	// 	console.log('current state of rooms: ', this.roomsMap);
	// 	return this.roomsMap[roomId] && this.roomsMap[roomId].length === 2;
	// }

	// async getOpponentInformation(
	// 	userId: number,
	// 	roomId: string,
	// ): Promise<{ login: string; image: string }> {
	// 	try {
	// 		// if the room exists
	// 		if (this.roomsMap[roomId]) {
	// 			// for player in the room our player is in
	// 			for (const playerId of this.roomsMap[roomId]) {
	// 				// check if the player's id is different from ours
	// 				if (playerId !== userId) {
	// 					// and retrieve that user's information
	// 					const userInformation = await this.prisma.user.findUnique({
	// 						where: {
	// 							id: playerId,
	// 						},
	// 					});
	// 					return {
	// 						login: userInformation.login,
	// 						image: userInformation.image,
	// 					};
	// 				}
	// 			}
	// 		}
	// 		return undefined;
	// 	} catch (error) {
	// 		console.error('Could not retrieve opponent information: ', error);
	// 		return undefined;
	// 	}
	// }

	// // Deletes all the rooms a user is alone in
	// deletePlayerSoloRooms(userId: number) {
	// 	for (const roomId in this.roomsMap) {
	// 		// Find the players in the room
	// 		const players = this.roomsMap[roomId];
	// 		if (players.length === 1 && players[0] === userId) {
	// 			console.log(
	// 				`[🧹] User #${userId} was alone in room ${roomId}, removing it`,
	// 			);
	// 			delete this.roomsMap[roomId];
	// 			console.log(
	// 				`[🧹] Current state of rooms: ${JSON.stringify(
	// 					this.roomsMap,
	// 					null,
	// 					4,
	// 				)}`,
	// 			);
	// 		}
	// 	}
	// }

	// // Removes a player from all the rooms they're playing someone against in
	// removePlayerFromOpponentRooms(userId: number) {
	// 	for (const roomId in this.roomsMap) {
	// 		// Find the players in the room
	// 		const players = this.roomsMap[roomId];

	// 		// See if our player is in that room by looking for the index
	// 		// of the first occurence of its Id
	// 		const playerIndex = players.indexOf(userId);
	// 		// If the user if found
	// 		if (playerIndex !== -1) {
	// 			console.log(
	// 				`[🧹] User #${userId} found in room ${roomId}, removing user`,
	// 			);
	// 			// Remove it from the awway
	// 			players.splice(playerIndex, 1);
	// 			// If there are no users left in the room, delete it
	// 			if (players.length === 0) {
	// 				delete this.roomsMap[roomId];
	// 				console.log(`[🧹] Room ${roomId} was empty, it's been removed`);
	// 			}
	// 		}
	// 	}
	// }

	/*
	░█░█░▀█▀░▀█▀░█░░░█▀▀
	░█░█░░█░░░█░░█░░░▀▀█
	░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀
	*/

	// // Find the user Id associated with a socketId
	// findSocketOwner(socketId: string): number | null {
	// 	if (socketId in this.socketUserMap) return this.socketUserMap[socketId];
	// }

	// // TODO: if we don't allow users to have more than one socket connected,
	// // do we need to store an array of sockets for each user or just one ?
	// // would be much simpler to store just one
	// cleanupSocketMaps(socket: Socket, socketOwnerId: number) {
	// 	// Remove this socket from the userSockets array
	// 	// so it's not associated with our user anymore
	// 	this.userSocketMap[socketOwnerId] = this.userSocketMap[
	// 		socketOwnerId
	// 	].filter((socketId) => socketId != socket.id);
	// 	// if the owner of that socket does not have any more sockets stored,
	// 	// remove their entry entirely, so we don't pollute our array
	// 	if (this.userSocketMap[socketOwnerId].length === 0)
	// 		delete this.userSocketMap[socketOwnerId];
	// 	// Also remove that socket from the socketOwners map
	// 	if (socket.id in this.socketUserMap) delete this.socketUserMap[socket.id];
	// }

	// // Notify opponents of a user that the user has left
	// notifyCurrentOpponents(userId: number, eventTitle: string) {
	// 	// Find all active rooms with opponents
	// 	const activeRoomIds: string[] = this.getActiveRoomIds(userId);
	// 	// Notify the opponents that we got disconnected
	// 	for (const roomId of activeRoomIds) this.server.in(roomId).emit(eventTitle);
	// }

	// // Returns all the room Ids a user is currently playing against someone in
	// getActiveRoomIds(userId: number): string[] {
	// 	let activeRoomIds: string[] = [];
	// 	for (const roomId in this.roomsMap) {
	// 		// Get the players of the room
	// 		const players = this.roomsMap[roomId];
	// 		// If there are two players
	// 		if (players.length === 2) {
	// 			// See if our player is in the room
	// 			const playerIndex = players.indexOf(userId);
	// 			// if our user is in the room, add the room to the array
	// 			if (playerIndex != -1) activeRoomIds.push(roomId);
	// 		}
	// 	}
	// 	return activeRoomIds;
	// }

	/*
	░█▀▄░█▀█░▀█▀░█▀█░█▀▄░█▀█░█▀▀░█▀▀
	░█░█░█▀█░░█░░█▀█░█▀▄░█▀█░▀▀█░█▀▀
	░▀▀░░▀░▀░░▀░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀
	*/

	// 	// Creates a gameSession entry in the db with both user information
	// 	async DBCreateGameEntry(roomId: string) {
	// 		console.log('[🔠] Creating game entry in database');
	// 		try {
	// 			const player1Id = this.roomsMap[roomId][0];
	// 			const player2Id = this.roomsMap[roomId][1];
	// 			const gameSession = await this.prisma.gameSession.create({
	// 				data: {
	// 					roomId: roomId,
	// 					user1: {
	// 						connect: { id: player1Id },
	// 					},
	// 					user2: {
	// 						connect: { id: player2Id },
	// 					},
	// 				},
	// 			});
	// 			if (!gameSession) throw new Error('Could not create game session');
	// 		} catch (error) {
	// 			console.error(`DBCreateGameEntry: ${error}`);
	// 		}
	// 	}

	// 	// Marks player as ready in a specific room
	// 	async DBUpdatePlayerReadyStatus(
	// 		playerId: number,
	// 		roomId: string,
	// 		status: boolean,
	// 	) {
	// 		// Find the corresponding session
	// 		const gameSession = await this.prisma.gameSession.findFirst({
	// 			where: {
	// 				roomId: roomId,
	// 			},
	// 		});
	// 		if (!gameSession) throw new Error('Could not find game session');
	// 		// Find out with player our user is
	// 		if (gameSession.user1Id === playerId)
	// 			return this.prisma.gameSession.update({
	// 				where: { id: gameSession.id },
	// 				data: { user1IsReady: status },
	// 			});
	// 		if (gameSession.user2Id === playerId)
	// 			return this.prisma.gameSession.update({
	// 				where: { id: gameSession.id },
	// 				data: { user2IsReady: status },
	// 			});
	// 		else throw new Error('Player not found in the session');
	// 	}

	// 	// Delete all game sessions that only have scores of 0 and no winner
	// 	async DBCleanUpEmptyGameSessions() {
	// 		const deletedGameSessions = await this.prisma.gameSession.deleteMany({
	// 			where: {
	// 				user1Score: 0,
	// 				user2Score: 0,
	// 				winner: undefined,
	// 			},
	// 		});
	// 		if (deletedGameSessions.count)
	// 			console.log(
	// 				`[🔠🧹] Cleaned up ${deletedGameSessions.count} empty game sessions`,
	// 			);
	// 	}
}
