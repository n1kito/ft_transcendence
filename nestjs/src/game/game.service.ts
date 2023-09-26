import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { randomBytes } from 'crypto';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameLogic } from './GameEntities/ServerGameLogic';
import { IPlayerInformation } from 'shared-lib/types/game';
import { Mutex } from 'async-mutex';

// import { IPlayerInformation } from '@types/game-types';

function decodeToken(client: Socket): any {
	return jwt.verify(
		client.handshake.auth.accessToken,
		process.env.JWT_SECRET_KEY,
	) as jwt.JwtPayload;
}

// This is everything that a room contains: a game instance, and players.
interface Room {
	gameInstance?: GameLogic;
	playersSocketIds: string[];
}

// This is a map of all of our current rooms
interface Rooms {
	[roomId: string]: Room;
}

interface Client {
	userId: number;
	roomId?: string;
}

interface IGameInterfaceBackupProps {
	player1SocketId: string;
	player1UserId: number;
	player1Score: number;
	player2SocketId: string;
	player2UserId: number;
	player2Score: number;
}

@Injectable()
export class GameService {
	private server: Server;

	private connectedClients: Map<string, Client> = new Map();
	private rooms: Rooms = {};

	private isProcessingRooms: Boolean = false;

	private roomAssignmentMutex: Mutex = new Mutex();

	constructor(private readonly prisma: PrismaService) {}

	setServer(server: Server) {
		this.server = server;
	}

	/*
	░█▀▀░█▀█░█▀█░█▀█░█▀▀░█▀▀░▀█▀░▀█▀░█▀█░█▀█░
	░█░░░█░█░█░█░█░█░█▀▀░█░░░░█░░░█░░█░█░█░█░
	░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░
	*/

	async handleNewClientConnection(newlyConnectedSocket: Socket) {
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
			const assignedRoomId = await this.assignRoom(
				newlyConnectedSocketId,
				newlyConnectedUserId,
			);

			// If our client's room is now full, send each user their opponent's
			// information and instantiate a game instance
			if (this.isRoomFull(assignedRoomId)) {
				console.log(
					'[🏠] Room is FULL. Sending players their opponent information',
				);
				this.handleRoomIsFull(newlyConnectedSocketId, assignedRoomId);
			}
		} catch (error) {
			console.error('Connection error: ', error.message);
			newlyConnectedSocket.disconnect();
		}
	}

	async handleClientDisconnect(socket: Socket) {
		console.log(
			`[🔴] User %s disconnected from socket %s`,
			this.connectedClients.get(socket.id).userId,
			socket.id,
		);

		// Remove the client from their current room
		const currentRoomId = this.connectedClients.get(socket.id)?.roomId;
		if (currentRoomId && this.rooms[currentRoomId]) {
			// Stop the game if there was a game going
			if (this.rooms[currentRoomId].gameInstance)
				this.rooms[currentRoomId].gameInstance.endGame();
			// Delete the client from the room
			console.log(`[🏠] Removing [%s] from room %s`, socket.id, currentRoomId);
			await this.removeUserFromRoom(currentRoomId, socket.id);
			// If the room has no players left, delete the room itself
			if (this.rooms[currentRoomId].playersSocketIds.length === 0) {
				console.log(`[🏠] Room ${currentRoomId} was empty, removing it !`);
				delete this.rooms[currentRoomId];
			}
			// Else, let the other player know that their partner has left
			else {
				const opponnentSocketId = this.rooms[currentRoomId].playersSocketIds[0];
				console.log(
					`Notifying opponent #${this.getUserIdFromSocket(
						opponnentSocketId,
					)} that we left the room`,
				);
				this.server.to(opponnentSocketId).emit('opponent-left');
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
	) {
		// console.log('[🕹️ ] Player moved', direction);
		const playerRoomId = this.getRoomIdFromSocketId(clientSocket.id);
		if (!playerRoomId) return; // TODO: do something else here ?
		// Update the paddle position
		// this.rooms[playerRoomId].gameInstance.setPlayerDirection(
		// 	clientSocket.id,
		// 	direction,
		// 	inputSequenceId,
		// );
		this.rooms[playerRoomId].gameInstance?.updatePlayerPosition(
			clientSocket.id,
			direction,
		);

		// Broadcast the new game state to our players
		// this.rooms[playerRoomId].gameInstance?.broadcastGameState();
	}

	createGameLogic(roomId: string) {
		// Find each user's socketId
		const [player1SocketId, player2SocketId] =
			this.rooms[roomId].playersSocketIds;
		console.log(
			`[🏠] Instantiating a game logic for players [${player1SocketId}] & [${player2SocketId}] in room #${roomId} `,
		);

		// Find the userId for each player
		let player1UserId: number, player2UserId: number;
		if (this.connectedClients.has(player1SocketId))
			player1UserId = this.connectedClients.get(player1SocketId).userId;
		if (this.connectedClients.has(player2SocketId))
			player2UserId = this.connectedClients.get(player2SocketId).userId;

		// Remove any preexisting gamelogic instance stored there
		if (this.rooms[roomId].gameInstance) delete this.rooms[roomId].gameInstance;

		// And create a new one
		this.rooms[roomId].gameInstance = new GameLogic(
			player1SocketId,
			player1UserId,
			player2SocketId,
			player2UserId,
			this.server,
		);
	}

	handlePowerupSettingUpdate(
		clientSocket: Socket,
		userDisabledPowerups: boolean,
	) {
		const roomId = this.getRoomIdFromSocketId(clientSocket.id);
		if (roomId) {
			const opponentSocketId = this.getOpponentSocketId(
				clientSocket.id,
				roomId,
			);
			if (opponentSocketId) {
				clientSocket
					.to(opponentSocketId)
					.emit('opponent-toggled-powerups', userDisabledPowerups);
				if (this.rooms[roomId].gameInstance) {
					this.rooms[roomId].gameInstance.powerupsEnabled =
						!userDisabledPowerups;
					console.log(
						`[${userDisabledPowerups ? '🪫 ' : '🔋'}] User [${
							clientSocket.id
						}] ${
							userDisabledPowerups ? 'disabled' : 'enabled'
						} powerups for room ${roomId}`,
					);
				}
			}
		}
	}

	handlePowerupActivated(clientSocket: Socket) {
		console.log(`[💪] Powerup was activated by [${clientSocket.id}]`);

		// Handle the actual powerup
		const roomId = this.getRoomIdFromSocketId(clientSocket.id);
		if (roomId) {
			const opponentSocketId = this.getOpponentSocketId(
				clientSocket.id,
				roomId,
			);
			const powerUpDescription = this.rooms[
				roomId
			]?.gameInstance.activatePowerUp(clientSocket.id);
			// Let the user know they won
			this.server.to(clientSocket.id).emit('power-up-claimed', {
				wonPowerUp: true,
				powerUpDescription: powerUpDescription,
			});
			if (opponentSocketId) {
				// Reset the opponent's powerup state
				this.server.to(opponentSocketId).emit('power-up-claimed', {
					wonPowerUp: false,
					powerUpDescription: powerUpDescription,
				});
			}
			// activate the powerup for our user
		}
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
	async assignRoom(
		newlyConnectedSocketId: string,
		newlyConnectedUserId: number,
	): Promise<string> {
		const releaseMutex = await this.roomAssignmentMutex.acquire();

		try {
			// Find an available room or create a new one
			let targetRoomId: string | undefined;

			// Find a room that only has one player who is not our player
			for (const roomId in this.rooms) {
				if (this.rooms[roomId].playersSocketIds.length == 1) {
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
					playersSocketIds: [],
				};
			}

			// Add the player to the room, and initialise their game state
			// TODO: this game state is not used anwywhere actually because it's not accessible by the game logic.
			this.rooms[targetRoomId].playersSocketIds.push(newlyConnectedSocketId);

			// Update the roomId to our client's entry in the connectedClients map
			if (this.connectedClients.has(newlyConnectedSocketId))
				this.connectedClients.get(newlyConnectedSocketId).roomId = targetRoomId;

			console.log(
				`[🏠] user #${newlyConnectedUserId} via socket [${newlyConnectedSocketId}] was assigned to room #${targetRoomId}`,
			);
			return targetRoomId;
		} finally {
			// Unlock the mutex
			releaseMutex();
		}
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
		return this.rooms[roomId].playersSocketIds.length === 2;
	}

	sharePlayersInfo(
		newlyConnectedSocketId: string,
		newlyConnectedUserid: number,
		assignedRoomId: string,
	) {
		// Find the socketId of the user's opponent
		const opponentSocketId = this.getOpponentSocketId(
			newlyConnectedSocketId,
			assignedRoomId,
		);
		// Get the userId associated with that socket
		let opponentUserId;
		if (this.connectedClients.has(opponentSocketId)) {
			opponentUserId = this.connectedClients.get(opponentSocketId).userId;
			console.log('Opponent user id is', opponentUserId);
		} else {
			console.log(
				`The opponent socket ID ${opponentSocketId} does not exist in connected clients.`,
			);
		}

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
		const opponentSocketId = this.getOpponentSocketId(socket.id, playerRoomId);
		// If they are still here, let them know that their opponent is ready
		if (opponentSocketId)
			this.server.to(opponentSocketId).emit('opponent-is-ready');
	}

	broadcastPlayerLeft(socket: Socket) {
		// Find the room they're currently in
		const playerRoomId = this.connectedClients.get(socket.id).roomId;
		// Find their current opponent
		const opponentSocketId = this.getOpponentSocketId(socket.id, playerRoomId);
		// If they are still here, let them know that their opponent is ready
		if (opponentSocketId)
			this.server.to(opponentSocketId).emit('opponent-left');
	}

	setPlayerAsReady(socket: Socket) {
		const playerRoomId = this.getRoomIdFromSocketId(socket.id);
		if (!playerRoomId) return; //TODO: do something better here ?

		// Use the game instance to set the player as ready
		const gameInstance = this.rooms[playerRoomId].gameInstance;
		gameInstance.setPlayerAsReady(socket.id);

		// If both players are ready, let both of them know and start the game
		if (this.rooms[playerRoomId].gameInstance.bothPlayersAreReady()) {
			// Send a game-ready update to each user
			this.rooms[playerRoomId].playersSocketIds.forEach((playerSocketId) => {
				this.server.to(playerSocketId).emit('game-started');
			});
			// Start the game and start sending game status to each user
			gameInstance.startGame();
			// TODO: these should be able to be moved somewhere more logical
			gameInstance.eventEmitter.on('game-ended', () => {
				// TODO: if the user disconnects right as the game ends we might have an issue here
				// where the game instance gets destroyed before we can store it

				// Creating a copy in case one of the users disconnects
				const gameInstanceCopy = {
					player1SocketId: Object.keys(gameInstance.players)[0],
					player1UserId: gameInstance.player1UserId,
					player1Score: gameInstance.player1Score,
					player2SocketId: Object.keys(gameInstance.players)[1],
					player2UserId: gameInstance.player2UserId,
					player2Score: gameInstance.player2Score,
				};
				console.log({ gameInstanceCopy });
				// Let each player know the game is over and whether someone won
				let gameHasWinner =
					gameInstance.player1Score === 11 || gameInstance.player2Score === 11;
				this.server.to(gameInstanceCopy.player1SocketId).emit('game-ended', {
					gameHasWinner: gameHasWinner,
					userWon: gameInstance.player1Score === 11,
				});
				this.server.to(gameInstanceCopy.player2SocketId).emit('game-ended', {
					gameHasWinner: gameHasWinner,
					userWon: gameInstance.player2Score === 11,
				});
				// If the game had a winner, store it in a gameSession in the database
				if (gameHasWinner) {
					this.createDBGameEntry(playerRoomId, gameInstanceCopy);
				}
				// Create a new game instance in the room, in case users want to play again
				this.createGameLogic(playerRoomId);
			});
		}
	}

	// User triggered the "shuffle button"
	// The server will try to find a room with another opponent waiting
	async handleUserWantsNewOpponent(clientSocket: Socket) {
		const releaseMutex = await this.roomAssignmentMutex.acquire();
		console.log(`[🏠] Socket [${clientSocket.id}] wants a new room please !`);
		try {
			// Get the id of the room the user is in
			let currentRoomId = this.getRoomIdFromSocketId(clientSocket.id);
			if (currentRoomId) {
				// Try to find another available room for the user
				const newRoomId = this.findAnotherRoom(clientSocket, currentRoomId);
				// If there is one
				if (newRoomId) {
					// Remove the user from their current room
					await this.removeUserFromRoom(currentRoomId, clientSocket.id);

					// Notify their current opponent
					this.broadcastPlayerLeft(clientSocket);

					// Add the player to their new room
					this.rooms[newRoomId].playersSocketIds.push(clientSocket.id);

					// Update the roomId to our client's entry in the connectedClients map
					if (this.connectedClients.has(clientSocket.id))
						this.connectedClients.get(clientSocket.id).roomId = newRoomId;

					// Let the oser user in that room know that someone showed up
					this.handleRoomIsFull(clientSocket.id, newRoomId);
				} else
					console.log(
						`[🏠] Could not find another room with a different opponent. Socket [${clientSocket.id}] is still in room ${currentRoomId}`,
					);
			}
		} finally {
			releaseMutex();
		}
	}

	// When room is full, each user receives their opponent's information
	// and a new gameLogic is created
	handleRoomIsFull(newlyConnectedSocketId: string, assignedRoomId: string) {
		let newlyConnectedUserId = undefined;
		if (this.connectedClients.has(newlyConnectedSocketId))
			newlyConnectedUserId = this.connectedClients.get(
				newlyConnectedSocketId,
			).userId;
		this.createGameLogic(assignedRoomId);
		// Add the players to a room

		// Share each player their opponent's information
		this.sharePlayersInfo(
			newlyConnectedSocketId,
			newlyConnectedUserId,
			assignedRoomId,
		);
	}

	async removeUserFromRoom(roomId: string, socketId: string) {
		const releaseMutex = await this.roomAssignmentMutex.acquire();

		try {
			// Remove the user from their current room
			const index = this.rooms[roomId].playersSocketIds.indexOf(socketId);
			if (index > -1) this.rooms[roomId].playersSocketIds.splice(index, 1);
			// Remove the roomId from the user's entry in the client map
			if (this.connectedClients.has(socketId))
				this.connectedClients.get(socketId).roomId = undefined;
			// Delete the game instance from the rooms
			// It will be recreated whenever a new user joins the room
			if (this.rooms[roomId].gameInstance)
				delete this.rooms[roomId].gameInstance;
		} finally {
			releaseMutex();
		}
	}

	// Looks for available room our user is not already in
	findAnotherRoom(
		clientSocket: Socket,
		currentRoomId: string,
	): string | undefined {
		let userId;
		if (this.connectedClients.has(clientSocket.id))
			userId = this.connectedClients.get(clientSocket.id).userId;
		let newRoomId: string | undefined = undefined;

		// Find a room that only has one player who is not our player
		for (const roomId in this.rooms) {
			if (this.rooms[currentRoomId].playersSocketIds.length == 1) {
				// Get the socketId of the player in the room
				const playerSocketId = this.rooms[currentRoomId].playersSocketIds[0];
				// Check if the userId associated to that socket is different from
				// the userId of the user we're trying to put in a room
				// If so, assign them to that room and stop looking
				if (this.connectedClients.get(playerSocketId).userId !== userId) {
					newRoomId = roomId;
					break;
				}
			}
		}
		return newRoomId;
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

	// Locate a room the user might be in
	getRoomIdFromSocketId(socketId: string): string | undefined {
		return this.connectedClients.get(socketId).roomId;
	}

	// Get the socketId of a user's opponent in a room
	getOpponentSocketId(
		userSocketId: string,
		roomId: string,
	): string | undefined {
		return this.rooms[roomId].playersSocketIds.find(
			(currentSocketId) => currentSocketId != userSocketId,
		);
	}

	// Find the playerID associated with a socketId
	getUserIdFromSocket(socketId: string): number | undefined {
		return this.connectedClients.get(socketId).userId;
	}

	/*
	░█▀▄░█▀█░▀█▀░█▀█░█▀▄░█▀█░█▀▀░█▀▀
	░█░█░█▀█░░█░░█▀█░█▀▄░█▀█░▀▀█░█▀▀
	░▀▀░░▀░▀░░▀░░▀░▀░▀▀░░▀░▀░▀▀▀░▀▀▀
	*/

	// Create a Database gameSession entry for a finished game that has a winner
	async createDBGameEntry(
		roomId: string,
		gameInstanceProperties: IGameInterfaceBackupProps,
	) {
		const { player1Score, player2Score, player1UserId, player2UserId } =
			gameInstanceProperties;

		// Find out who won
		const winnerId =
			player1Score > player2Score ? player1UserId : player2UserId;
		const loserId = player1Score > player2Score ? player2UserId : player1UserId;
		// Create the game sessions
		this.prisma.gameSession
			.create({
				data: {
					player1Id: player1UserId,
					player1Score: player1Score,
					player2Id: player2UserId,
					player2Score: player2Score,
					winnerId: winnerId,
				},
			})
			.then(() => {
				console.log(
					`Successfully created database entry for game in room ${roomId}`,
				);
			})
			.catch((error) => {
				console.error('Error creating DB game entry:', error.message);
			});

		// Check if the winner beat their current target and handle that
		if (await this.userBeatTheirCurrentTarget(winnerId, loserId)) {
			await this.increaseUserKillCount(winnerId);
			await this.assignNewTargetToUser(winnerId);
		}
		// Update the bestie of each user
		await this.updateBestie(player1UserId);
		await this.updateBestie(player2UserId);
		// Update the rival fo each user
		await this.updateRival(player1UserId);
		await this.updateRival(player2UserId);
	}

	async userBeatTheirCurrentTarget(winnerId: number, loserId: number) {
		// Get the target of our currnet winner, selecting only their id
		const { target } = await this.prisma.user.findUnique({
			where: {
				id: winnerId,
			},
			select: {
				target: {
					select: {
						id: true,
					},
				},
			},
		});
		// If the user had a target
		if (target) return target.id === loserId;
		return false;
	}

	async increaseUserKillCount(userId: number) {
		try {
			await this.prisma.user.update({
				where: { id: userId },
				data: {
					killCount: {
						increment: 1,
					},
				},
			});
		} catch (error) {
			console.error('Could not increase user kill count:', error.message);
		}
	}

	async assignNewTargetToUser(userId: number) {
		// Count total users excluding the specific user
		const totalUsers = await this.prisma.user.count({
			where: {
				id: {
					not: userId,
				},
			},
		});
		// 	// Generate a random offset
		const randomOffset = Math.floor(Math.random() * totalUsers);
		// 	// Fetch the random user using the offset
		const randomUser = await this.prisma.user.findFirst({
			where: {
				id: {
					not: userId,
				},
			},
			skip: randomOffset,
		});
		if (randomUser) {
			await this.prisma.user.update({
				where: { id: userId },
				data: { targetId: randomUser.id, targetDiscoveredByUser: false },
			});
		} else {
			console.log('Could not find random user');
		}
	}

	// Find user's bestie, ie the user they've played the most games against
	// If there is a tie, bestie will be the user with the latest game
	async updateBestie(userId: number) {
		try {
			// Fetch all games our user was in, either as player1 or player 2
			const gamesPlayed = await this.prisma.gameSession.findMany({
				where: {
					OR: [{ player1Id: userId }, { player2Id: userId }],
				},
				select: {
					player1Id: true,
					player2Id: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});
			// Loop through those and count the frequency of each opponent
			const opponentCounts: {
				[key: number]: { count: number; latestGame: Date };
			} = {};
			for (const game of gamesPlayed) {
				const opponentId =
					game.player1Id === userId ? game.player2Id : game.player1Id;
				// if it's the first time we're counting the user
				if (!opponentCounts[opponentId])
					opponentCounts[opponentId] = { count: 0, latestGame: new Date(0) };
				opponentCounts[opponentId].count++;
				opponentCounts[opponentId].latestGame = new Date(
					Math.max(
						opponentCounts[opponentId].latestGame.getTime(),
						game.createdAt.getTime(),
					),
				);
			}
			// If there are ties, the bestie is the user with the latest game session
			let mostFrequentOpponentId = null;
			let highestCount = 0;
			let latestGame = new Date(0);

			for (const [
				opponentId,
				{ count, latestGame: latestGameWithOpponent },
			] of Object.entries(opponentCounts)) {
				if (
					count > highestCount ||
					(count === highestCount && latestGameWithOpponent > latestGame)
				) {
					mostFrequentOpponentId = parseInt(opponentId, 10);
					highestCount = count;
					latestGame = latestGameWithOpponent;
				}
			}
			// Update the bestie in the database, if there is one
			if (mostFrequentOpponentId)
				await this.prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						bestieId: mostFrequentOpponentId,
					},
				});
		} catch (error) {
			console.error('updateBestie()', error.message);
		}
	}

	// Update user rival, meaning the person they've lost the most games against
	async updateRival(userId: number) {
		try {
			// Fetch all games our user was in, either as player1 or player 2,
			// and did not win
			const gamesLost = await this.prisma.gameSession.findMany({
				where: {
					OR: [{ player1Id: userId }, { player2Id: userId }],
					NOT: { winnerId: userId },
				},
				select: {
					player1Id: true,
					player2Id: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			// Step 2: Tally each opponent
			const opponentCounts: {
				[opponentId: number]: { count: number; latestGame: Date };
			} = {};

			for (const game of gamesLost) {
				let opponentId =
					game.player1Id === userId ? game.player2Id : game.player1Id;

				if (!opponentCounts[opponentId]) {
					opponentCounts[opponentId] = { count: 0, latestGame: game.createdAt };
				}

				opponentCounts[opponentId].count++;
				opponentCounts[opponentId].latestGame = game.createdAt;
			}

			// Step 3: Find the most frequent opponent
			let mostFrequentOpponentId: number | null = null;
			let highestCount = 0;
			let latestGame: Date | null = null;

			for (const [
				opponentId,
				{ count, latestGame: latestGameWithOpponent },
			] of Object.entries(opponentCounts)) {
				if (
					count > highestCount ||
					(count === highestCount && latestGameWithOpponent > latestGame)
				) {
					mostFrequentOpponentId = parseInt(opponentId, 10);
					highestCount = count;
					latestGame = latestGameWithOpponent;
				}
			}

			if (mostFrequentOpponentId)
				await this.prisma.user.update({
					where: {
						id: userId,
					},
					data: {
						rivalId: mostFrequentOpponentId,
					},
				});
		} catch (error) {
			console.error('updateRival()', error.message);
		}
	}
}
