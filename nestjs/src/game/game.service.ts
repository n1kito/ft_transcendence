import { Injectable } from '@nestjs/common';
import { GameRoomStatus, gameRoom } from '@prisma/client';
import { create } from 'domain';
import { PrismaService } from 'src/services/prisma-service/prisma.service';

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService) {}

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

	// The requesting user joins a game with no opponent in mind
	// (meaning it's not from a chat invite)
	async handleSoloRoomAssignment(userId: number): Promise<gameRoom> {
		let assignedRoom: gameRoom;

		// Find an available room the user might already be in
		// TODO: issue, if the user is waiting in this room in another tab,
		// we're going to give them the same room here, but maybe that's not an
		// issue...? Like they can only play in one place at once normally, so
		// the second screen they're not playing from would just show the game being played
		assignedRoom = await this.findAvailableRoomUserIsIn(userId);
		if (!assignedRoom) {
			// If there are none, find any available room with "Waiting"
			// status that our user is not already in
			assignedRoom = await this.findRoomWaiting(userId);
			if (!assignedRoom) {
				// If there are no available rooms, create one with our user inside
				assignedRoom = await this.createRoomWithSingleUser(userId);
				if (!assignedRoom)
					// If there is still no room assigned, there was an error somewhere
					throw new Error('Could not assign room to single player');
			}
		}
		return assignedRoom;
	}

	// Our user want to play against a specific opponent
	async handleAdversaryRoomAssignment(
		userId: number,
		opponentId: number,
	): Promise<gameRoom> {
		let assignedRoom: gameRoom;

		// Find a room we're migh already be in with our adversary
		assignedRoom = await this.findRoomWithOpponent(userId, opponentId);
		// If we find one, return it
		if (assignedRoom) return assignedRoom;
		// Else
		// Find an available room the user might already be in
		assignedRoom = await this.findAvailableRoomUserIsIn(userId);
		if (!assignedRoom) {
			// If there are no pre-existing rooms for our user, create one
			assignedRoom = await this.createRoomWithSingleUser(userId);
			if (!assignedRoom)
				// If there is still no room assigned, there was an error somewhere
				throw new Error('Could not assign room for adversary');
		}
		// Now that we have a room, we just need to add our adversary to it and
		// mark it as full
		const updatedRoom = this.prisma.gameRoom.update({
			where: { id: assignedRoom.id },
			data: {
				game: {
					update: {
						players: {
							create: {
								userId: opponentId,
							},
						},
					},
				},
				gameStatus: GameRoomStatus.Full,
			},
		});
		return updatedRoom;
	}

	// Find an available room user might already be in
	async findAvailableRoomUserIsIn(userId: number): Promise<gameRoom | null> {
		const availableRoomUserIsIn = await this.prisma.gameRoom.findFirst({
			where: {
				gameStatus: GameRoomStatus.Waiting,
				game: {
					players: {
						some: {
							userId: userId,
						},
					},
				},
			},
		});
		return availableRoomUserIsIn;
	}

	// Find any available room with "Waiting" status
	// That's useful to find any room where another player is waiting
	async findRoomWaiting(userId: number): Promise<gameRoom | null> {
		const roomWithWaitingStatus = await this.prisma.gameRoom.findFirst({
			where: {
				gameStatus: GameRoomStatus.Waiting, // find rooms set to waiting
				game: {
					players: {
						none: { userId: userId }, // where the user waiting is not us
					},
				},
			},
		});
		return roomWithWaitingStatus;
	}

	// Create a new room with our user already inside of it (will create the game session)
	async createRoomWithSingleUser(userId: number): Promise<gameRoom> {
		const newRoom = await this.prisma.gameRoom.create({
			// Create a new gameRoom
			data: {
				game: {
					// Create a new game inside of that game room
					create: {
						players: {
							// Create a new gameSession inside of that game
							create: {
								userId: userId, // With our userId as reference
							},
						},
					},
				},
			},
		});
		return newRoom;
	}

	// Find a room we're already in with our opponent
	async findRoomWithOpponent(
		userId: number,
		opponentId: number,
	): Promise<gameRoom | null> {
		// This will find a room where both players are
		const roomWithBothPlayers = await this.prisma.gameRoom.findFirst({
			where: {
				AND: [
					{
						game: {
							players: {
								some: {
									userId: userId,
								},
							},
						},
					},
					{
						game: {
							players: {
								some: {
									userId: opponentId,
								},
							},
						},
					},
				],
			},
		});
		return roomWithBothPlayers;
	}
}
