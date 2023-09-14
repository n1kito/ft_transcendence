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
		// Find either a room with someone waiting, or generate a new room ID
		const roomId =
			this.findRoomWithOpponentWaiting(userId) || this.createNewRoom(userId);
		// Add our user to that room
		this.roomsMap[roomId].push(userId);
		console.log(`[🏓] Our user was just added to room #${roomId}`);
		// Return the room Id
		return roomId;
	}

	findRoomWithOpponentWaiting(userId: number): string | undefined {
		const soloRoom = Object.keys(this.roomsMap).find((roomId) => {
			// Retrieve the players in the room
			const players = this.roomsMap[roomId];
			// Returns whether there is only one player in it or not
			// and if that player is not us
			return players.length === 1 && players[0] != userId;
		});
		console.log(
			`[🏓] Found ${soloRoom ? 'a' : 'no'} room with someone waiting${
				soloRoom ? ':' : '.'
			}`,
			this.roomsMap[soloRoom],
		);
		// If a solo room is found, return its id, or return nothing
		return soloRoom || undefined;
	}

	createNewRoom(userId: number): string {
		console.log('[🏓] Generating a new room Id and creating the room');
		let roomId;
		do {
			roomId = `${userId}-room-${randomBytes(5).toString('hex')}`;
		} while (this.roomsMap[roomId]);
		// Create the entry in the map
		this.roomsMap[roomId] = [];
		return roomId;
	}

	isRoomFull(roomId: string): boolean {
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

	// // If the user gave an adversary Id
	// let adversaryUser;

	// // Find an available room user might already be in
	// else
	// 	assignedRoom = await this.gameService.findAvailableRoomUserIsIn(userId);
	// if (!assignedRoom) {
	// 	// If there are none, find any available room with "Waiting" status:
	// 	assignedRoom = await this.gameService.findAnyAvailableRoom();
	// 	// If there are no rooms found, create a new one with our player inside
	// 	if (!assignedRoom)
	// 		assignedRoom = await this.gameService.createRoomWithSingleUser(
	// 			userId,
	// 		);
	// }

	// // The requesting user joins a game with no opponent in mind
	// // (meaning it's not from a chat invite)
	// async handleSoloRoomAssignment(userId: number): Promise<gameRoom> {
	// 	let assignedRoom: gameRoom;

	// 	// Find an available room the user is not already in, meaning another player is waiting
	// 	assignedRoom = await this.findRoomWaiting(userId);
	// 	if (!assignedRoom) {
	// 		// If there are none, find any room we might already be waiting in
	// 		assignedRoom = await this.findAvailableRoomUserIsIn(userId);
	// 		if (!assignedRoom) {
	// 			// If there are no available rooms, create one with our user inside
	// 			assignedRoom = await this.createRoomWithSingleUser(userId);
	// 			if (!assignedRoom)
	// 				// If there is still no room assigned, there was an error somewhere
	// 				throw new Error('Could not assign room to single player');
	// 		}
	// 	}
	// 	return assignedRoom;
	// }

	// // Our user want to play against a specific opponent
	// async handleAdversaryRoomAssignment(
	// 	userId: number,
	// 	opponentId: number,
	// ): Promise<gameRoom> {
	// 	let assignedRoom: gameRoom;

	// 	// Find a room we're migh already be in with our adversary
	// 	assignedRoom = await this.findRoomWithOpponent(userId, opponentId);
	// 	// If we find one, return it
	// 	if (assignedRoom) return assignedRoom;
	// 	// Else
	// 	// Find an available room the user might already be in
	// 	assignedRoom = await this.findAvailableRoomUserIsIn(userId);
	// 	if (!assignedRoom) {
	// 		// If there are no pre-existing rooms for our user, create one
	// 		assignedRoom = await this.createRoomWithSingleUser(userId);
	// 		if (!assignedRoom)
	// 			// If there is still no room assigned, there was an error somewhere
	// 			throw new Error('Could not assign room for adversary');
	// 	}
	// 	// TODO: there is an issue here, we are adding our player to a room
	// 	// that we might already be in, because createRoomWithSingleUser adds our user to the room too
	// 	// Now that we have a room, we just need to add our adversary to it and
	// 	// mark it as full
	// 	const updatedRoom = this.prisma.gameRoom.update({
	// 		where: { id: assignedRoom.id },
	// 		data: {
	// 			game: {
	// 				update: {
	// 					players: {
	// 						create: {
	// 							userId: opponentId,
	// 						},
	// 					},
	// 				},
	// 			},
	// 			gameStatus: GameRoomStatus.Full,
	// 		},
	// 		// Also include the opponent's information in the response
	// 		include: {
	// 			game: {
	// 				include: {
	// 					players: {
	// 						where: {
	// 							userId: {
	// 								not: userId,
	// 							},
	// 						},
	// 						include: {
	// 							user: true,
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return updatedRoom;
	// }

	// // Find an available room user might already be in
	// async findAvailableRoomUserIsIn(userId: number): Promise<gameRoom | null> {
	// 	const availableRoomUserIsIn = await this.prisma.gameRoom.findFirst({
	// 		where: {
	// 			gameStatus: GameRoomStatus.Waiting,
	// 			game: {
	// 				players: {
	// 					some: {
	// 						userId: userId,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return availableRoomUserIsIn;
	// }

	// // Find any available room with "Waiting" status
	// // That's useful to find any room where another player is waiting
	// async findRoomWaiting(userId: number): Promise<gameRoom | null> {
	// 	// Find the room
	// 	const roomWithWaitingStatus = await this.prisma.gameRoom.findFirst({
	// 		where: {
	// 			gameStatus: GameRoomStatus.Waiting, // find rooms set to waiting
	// 			game: {
	// 				players: {
	// 					none: { userId: userId }, // where the user waiting is not us
	// 				},
	// 			},
	// 		},
	// 	});
	// 	const updatedRoom = await this.prisma.gameRoom.update({
	// 		where: {
	// 			id: roomWithWaitingStatus.id,
	// 		},
	// 		data: {
	// 			game: {
	// 				players: {
	// 					create: {
	// 						userId: userId,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return roomWithWaitingStatus;
	// }

	// // Create a new room with our user already inside of it (will create the game session)
	// async createRoomWithSingleUser(userId: number): Promise<gameRoom> {
	// 	const newRoom = await this.prisma.gameRoom.create({
	// 		// Create a new gameRoom
	// 		data: {
	// 			game: {
	// 				// Create a new game inside of that game room
	// 				create: {
	// 					players: {
	// 						// Create a new gameSession inside of that game
	// 						create: {
	// 							userId: userId, // With our userId as reference
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return newRoom;
	// }

	// // Find a room we're already in with our opponent
	// async findRoomWithOpponent(
	// 	userId: number,
	// 	opponentId: number,
	// ): Promise<gameRoom | null> {
	// 	// This will find a room where both players are
	// 	const roomWithBothPlayers = await this.prisma.gameRoom.findFirst({
	// 		where: {
	// 			AND: [
	// 				{
	// 					game: {
	// 						players: {
	// 							some: {
	// 								userId: userId,
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{
	// 					game: {
	// 						players: {
	// 							some: {
	// 								userId: opponentId,
	// 							},
	// 						},
	// 					},
	// 				},
	// 			],
	// 		},
	// 		include: {
	// 			game: {
	// 				include: {
	// 					players: {
	// 						where: {
	// 							userId: {
	// 								not: userId,
	// 							},
	// 						},
	// 						include: {
	// 							user: true,
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	});
	// 	return roomWithBothPlayers;
	// }
}
