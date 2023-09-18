import { Injectable } from '@nestjs/common';
// import { GameRoomStatus, gameRoom } from '@prisma/client';
import { create } from 'domain';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { randomBytes } from 'crypto';
import { urlencoded } from 'express';

@Injectable()
export class GameService {
	// Declare a map of rooms that will store a room-ID and an array of players
	private roomsMap: { [roomId: string]: number[] };

	constructor(private readonly prisma: PrismaService) {
		this.roomsMap = {};
	}

	// The requesting user joins a game with no opponent in mind
	// (meaning it's not from a chat invite)
	handleSoloRoomAssignment(userId: number): string {
		// Find a room the user might already be playing in
		const roomUserIsAlreadyPlayingIn =
			this.findRoomUserIsAlreadyPlayingIn(userId);
		if (roomUserIsAlreadyPlayingIn) {
			console.log(
				`[🏓] User ${userId} was already playing in room #${roomUserIsAlreadyPlayingIn}`,
			);
			return roomUserIsAlreadyPlayingIn;
		}
		// Find a room with an opponent waiting for a partner
		const roomWhereOpponentIsWaiting = this.findRoomWithOpponentWaiting(userId);
		if (roomWhereOpponentIsWaiting) {
			this.roomsMap[roomWhereOpponentIsWaiting].push(userId);
			console.log(
				`[🏓] Added user ${userId} to #${roomWhereOpponentIsWaiting}, where someone was waiting`,
			);
			return roomWhereOpponentIsWaiting;
		}
		// Find a room where our user is alone
		const roomWithOnlyUser = this.findSoloRoom(userId);
		if (roomWithOnlyUser) {
			console.log(
				`[🏓] Found room ${roomWithOnlyUser} where user ${userId} was alone.`,
			);
			return roomWithOnlyUser;
		}
		// Create a new room
		const newRoom = this.createNewRoom(userId);
		this.roomsMap[newRoom].push(userId);
		// Return the room Id
		return newRoom;
	}

	findRoomWithOpponentWaiting(userId: number): string | undefined {
		const opponentRoomId: string | undefined = Object.keys(this.roomsMap).find(
			(roomId) => {
				// Retrieve the players in the room
				const players = this.roomsMap[roomId];
				// Returns whether there is only one player in it or not
				// and if that player is not us
				return players.length === 1 && players[0] != userId;
			},
		);
		if (opponentRoomId)
			console.log(
				`[🏓] Found a room with someone waiting:`,
				this.roomsMap[opponentRoomId],
			);
		else console.log(`[🏓] Found no room with someone waiting.`);
		// If a room with an opponent is found, return its id, or return nothing
		return opponentRoomId;
	}

	findSoloRoom(userId: number) {
		const soloRoomId: string | undefined = Object.keys(this.roomsMap).find(
			(roomId) => {
				const players = this.roomsMap[roomId];
				return players.length === 1 && players[0] === userId;
			},
		);
		if (soloRoomId)
			console.log(
				`[🏓] Found a room user was alone in:`,
				this.roomsMap[soloRoomId],
			);
		else console.log(`[🏓] Found no room user was solo in.`);
		// If a solo room is found, return its id, or return nothing
		return soloRoomId;
	}

	findRoomUserIsAlreadyPlayingIn(userId: number): string | undefined {
		const currentRoom: string | undefined = Object.keys(this.roomsMap).find(
			(roomId) => {
				// Retrieve the players in the room
				const players = this.roomsMap[roomId];
				// Returns whether there is only one player in it or not
				// and if that player is not us
				return (
					players.length === 2 && (players[0] == userId || players[1] == userId)
				);
			},
		);
		if (currentRoom)
			console.log(
				`[🏓] Found a room user was already playing in:`,
				this.roomsMap[currentRoom],
			);
		else console.log(`[🏓] Found no room user was already playing in.`);
		// If a room with an opponent is found, return its id, or return nothing
		return currentRoom;
	}

	createNewRoom(userId: number): string {
		let roomId;
		do {
			roomId = `${userId}-room-${randomBytes(5).toString('hex')}`;
		} while (this.roomsMap[roomId]);
		// Create the entry in the map
		this.roomsMap[roomId] = [];
		console.log(`[🏓] User ${userId} created room ${roomId}`);
		return roomId;
	}

	isRoomFull(roomId: string): boolean {
		console.log('current state of rooms: ', this.roomsMap);
		return this.roomsMap[roomId] && this.roomsMap[roomId].length === 2;
	}

	async getOpponentInformation(
		userId: number,
		roomId: string,
	): Promise<{ login: string; image: string }> {
		try {
			// if the room exists
			if (this.roomsMap[roomId]) {
				// for player in the room our player is in
				for (const playerId of this.roomsMap[roomId]) {
					// check if the player's id is different from ours
					if (playerId !== userId) {
						// and retrieve that user's information
						const userInformation = await this.prisma.user.findUnique({
							where: {
								id: playerId,
							},
						});
						return {
							login: userInformation.login,
							image: userInformation.image,
						};
					}
				}
			}
			return undefined;
		} catch (error) {
			console.error('Could not retrieve opponent information: ', error);
			return undefined;
		}
	}

	// Deletes all the rooms a user is alone in
	deletePlayerSoloRooms(userId: number) {
		for (const roomId in this.roomsMap) {
			// Find the players in the room
			const players = this.roomsMap[roomId];
			if (players.length === 1 && players[0] === userId) {
				console.log(
					`[🧹] User #${userId} was alone in room ${roomId}, removing it`,
				);
				delete this.roomsMap[roomId];
				console.log(
					`[🧹] Current state of rooms: ${JSON.stringify(
						this.roomsMap,
						null,
						4,
					)}`,
				);
			}
		}
	}

	// Removes a player from all the rooms they're playing someone against in
	removePlayerFromOpponentRooms(userId: number) {
		for (const roomId in this.roomsMap) {
			// Find the players in the room
			const players = this.roomsMap[roomId];

			// See if our player is in that room by looking for the index
			// of the first occurence of its Id
			const playerIndex = players.indexOf(userId);
			// If the user if found
			if (playerIndex !== -1) {
				console.log(
					`[🧹] User #${userId} found in room ${roomId}, removing user`,
				);
				// Remove it from the awway
				players.splice(playerIndex, 1);
				// If there are no users left in the room, delete it
				if (players.length === 0) {
					delete this.roomsMap[roomId];
					console.log(`[🧹] Room ${roomId} was empty, it's been removed`);
				}
			}
		}
	}

	// Returns all the room Ids a user is currently playing against someone in
	getActiveRoomIds(userId: number): string[] {
		let activeRoomIds: string[] = [];
		for (const roomId in this.roomsMap) {
			// Get the players of the room
			const players = this.roomsMap[roomId];
			// If there are two players
			if (players.length === 2) {
				// See if our player is in the room
				const playerIndex = players.indexOf(userId);
				// if our user is in the room, add the room to the array
				if (playerIndex != -1) activeRoomIds.push(roomId);
			}
		}
		return activeRoomIds;
	}

	// Creates a gameSession entry in the db with both user information
	async createDBGameEntry(roomId: string) {
		console.log('[🔠] Creating game entry in database');
		try {
			const player1Id = this.roomsMap[roomId][0];
			const player2Id = this.roomsMap[roomId][1];
			const gameSession = await this.prisma.gameSession.create({
				data: {
					roomId: roomId,
					user1: {
						connect: { id: player1Id },
					},
					user2: {
						connect: { id: player2Id },
					},
				},
			});
			if (!gameSession) throw new Error('Could not create game session');
		} catch (error) {
			console.error(`createDBGameEntry: ${error}`);
		}
	}

	// Marks player as ready in a specific room
	async DBUpdatePlayerReadyStatus(
		playerId: number,
		roomId: string,
		status: boolean,
	) {
		// Find the corresponding session
		const gameSession = await this.prisma.gameSession.findFirst({
			where: {
				roomId: roomId,
			},
		});
		if (!gameSession) throw new Error('Could not find game session');
		// Find out with player our user is
		if (gameSession.user1Id === playerId)
			return this.prisma.gameSession.update({
				where: { id: gameSession.id },
				data: { user1IsReady: status },
			});
		if (gameSession.user2Id === playerId)
			return this.prisma.gameSession.update({
				where: { id: gameSession.id },
				data: { user2IsReady: status },
			});
		else throw new Error('Player not found in the session');
	}

	async DBCleanUpEmptyGameSessions() {
		const deletedGameSessions = await this.prisma.gameSession.deleteMany({
			where: {
				user1Score: 0,
				user2Score: 0,
				winner: undefined,
			},
		});
		if (deletedGameSessions.count)
			console.log(
				`[🔠🧹] Cleaned up ${deletedGameSessions.count} empty game sessions`,
			);
	}
}
