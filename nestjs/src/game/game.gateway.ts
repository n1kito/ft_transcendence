import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	WebSocketServer,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { GameService } from './game.service';
import { GameRoomStatus, PlayerGameStatus, gameRoom } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface IRoomInformationProps {
	id: number;
	state: string;
}

function decodeToken(client: Socket): any {
	return jwt.verify(
		client.handshake.auth.accessToken,
		process.env.JWT_SECRET_KEY,
	) as jwt.JwtPayload;
}

@WebSocketGateway({
	path: '/ws/',
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	// We declare a map of user sockets, each key is a userId that will store
	// all the sockets the user is using to talk to the server
	private userSockets: { [userId: number]: string[] };
	// This will log the socket along with its corresponding userId, so I
	// can easily find who is connected to which socket
	private socketOwners: { [socket: string]: number };

	constructor(
		private readonly prisma: PrismaService,
		private readonly gameService: GameService,
	) {
		this.userSockets = {};
		this.socketOwners = {};
	}

	afterInit(server: Server) {
		console.log('🦄 Server initialized !');
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log('🟢 Client connected: ', client.id);
		try {
			const decodedPayload = decodeToken(client);
			// Extract our userId from the payload, so we know who's connected
			const userId = decodedPayload.userId;
			console.log(`🎉 Client token verified for user ${userId}!`);
			client.emit('identification_ok');
			// Add the userId to our map along with they socket identifier
			// This allows to to track all the sockets our user is using to
			// play.
			// if the user does not have an array yet, initialize one
			if (!this.userSockets[userId]) {
				this.userSockets[userId] = [];
			}
			// If our user already has 5 sockets active, we reject their connection
			// it's not the fete ici.
			if (this.userSockets[userId].length === 5) {
				console.log(
					`❗User #${userId} already has ${this.userSockets[userId].length} sockets in use, we say NO.`,
				);
				client.emit('connection_limit_reached');
				throw new Error('user reached max connections');
			} else {
				// Add the socket id to the array of sockets for the client
				this.userSockets[userId].push(client.id);
				// Link the socket id to the client Id, so we can find its owner easily
				this.socketOwners[client.id] = userId;
				console.log('');
			}
		} catch (error) {
			console.error('Connection error:', error);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		// When a client disconnects, we want to set all of their game sessions
		// as waiting, so we can handle reconnection later
		this.setAllUserGameSessionsTo(123, PlayerGameStatus.Waiting);
		// TODO: delete all user game sessions where they are the only player
		// this would happen when the user tries to join a game and leaves before
		// being given an opponent, or game sessions where they're just waiting
		// for someone to show up

		// Remove this socket from the userSockets array
		// so it's not associated with our user anymore
		const socketOwnerId = this.findSocketOwner(client.id);
		// if we were able to locate the owner of the socket
		if (socketOwnerId) {
			// we're replacing the entry at sockerOwnerId with an array of values
			// that do not match the socketId we'd like to remove
			this.userSockets[socketOwnerId] = this.userSockets[socketOwnerId].filter(
				(socketId) => socketId != client.id,
			);
			// if the owner of that socket does not have any more sockets stored,
			// remove their entry entirely, so we don't pollute our array
			if (this.userSockets[socketOwnerId].length === 0)
				delete this.userSockets[socketOwnerId];
		}
		// Also remove that socket from the socketOwners map
		if (client.id in this.socketOwners) delete this.socketOwners[client.id];
		console.log(
			'🔴 Client %s disconnected from socket %s',
			socketOwnerId,
			client.id,
		);
		if (Object.keys(this.socketOwners).length > 0)
			console.log(
				'📊 Here are the sockets we are still tracking: ',
				this.socketOwners,
			);
		if (Object.keys(this.userSockets).length > 0)
			console.log('📊 Here are the users still connected: ', this.userSockets);
		else console.log('📊 There are no more users connected');
	}

	private findSocketOwner(socketId: string): number | null {
		if (socketId in this.socketOwners) return this.socketOwners[socketId];
	}

	@SubscribeMessage('onlineStatusConfirmation')
	handleMessage(
		client: any,
		payload: any,
	): { event: string; data: { message: string } } {
		console.log('Client wants to make sure they are connected');
		return {
			event: 'onlineStatusResponse',
			data: { message: 'Hey gorgeous ! 😘 You are indeed connected' },
		};
	}

	// User requested a game room for themselves, they don't already have an opponent
	@SubscribeMessage('request solo game room')
	async assignSoloGameRoom(
		client: any,
		payload: { userId: number },
	): Promise<{ event: string; data: { gameRoomId: number } }> {
		console.log('Client would like to find a solo room !');

		// let assignedRoom;
		const userId = payload.userId;

		// // Find an available room the user might already be in
		// assignedRoom = await this.gameService.findAvailableRoomUserIsIn(
		// 	payload.userId,
		// );
		// if (!assignedRoom) {
		// 	// If there are none, find any available room with "Waiting"
		// 	// status that our user is not already in
		// 	assignedRoom = await this.gameService.findRoomWaiting(payload.userId);
		// 	if (!assignedRoom) {
		// 		// If there are no available rooms, create one with our user inside
		// 		assignedRoom = await this.gameService.createRoomWithSingleUser(
		// 			payload.userId,
		// 		);
		// 		if (!assignedRoom)
		// 			// If there is still no room assigned, there was an error somewhere
		// 			throw new Error('Could not assign room to single player');
		// 	}
		// }
		try {
			// Try to find a room for our user
			const assignedRoom = await this.gameService.handleSoloRoomAssignment(
				userId,
			);
			return {
				event: 'assigned game room',
				data: { gameRoomId: assignedRoom.id },
			};
		} catch (error) {
			console.error(
				'this.userSockets.lengthould not assign solo game room: ',
				error,
			);
			return { event: 'error assigning solo room', data: { gameRoomId: -1 } };
		}
	}

	// This will look for a room for the user, join the room and add them to the corresponding
	// socket room, so they can receive updates. The user will received the roomId so they
	// know how to communicate to it as well.
	@SubscribeMessage('join-room')
	async joinRoom(
		client: any,
		data: { userId: number; opponentId: number | undefined },
	) {
		try {
			let assignedRoom: gameRoom;

			// Find a room for our user and their opponent
			if (data.opponentId) {
				assignedRoom = await this.gameService.handleAdversaryRoomAssignment(
					data.userId,
					data.opponentId,
				);
			}
			// Find an available room or create a room for our user
			else {
				assignedRoom = await this.gameService.handleSoloRoomAssignment(
					data.userId,
				);
			}
			console.log('Assigned room', assignedRoom);

			// Join the user to the socket room corresponding to it
			const roomName = `game-room-#${assignedRoom.id}`;
			console.log('Room name is: ', roomName);
			client.join(roomName);
			client.emit('room-joined', {
				id: assignedRoom.id,
				state: assignedRoom.gameStatus,
			});

			// If the room is full, send both users the info of both players
			// the front takes care of identifying which one is the opponent
			if (assignedRoom.gameStatus === GameRoomStatus.Full) {
				console.log('Room is full, sending users their information');
				this.server.in(roomName).emit('player-information', {});
				// TODO: I STOPPED HERE, I ACTUALLY NEED TO SEND THE INFORMATION
				// AND THEN IN THE FRONT IDENFITY WHICH IS OUR OPPONENT AND UPDATE
				// THE GAME STATE THIS WAY
			}
		} catch (error) {
			console.error('Could not join game room: ', error);
			client.emit('error-joining-room');
		}
	}

	private getRoomClientCount(roomId: number): number {
		const roomClients = this.server.sockets.adapter.rooms.get(`${roomId}`);
		return roomClients ? roomClients.size : 0;
	}

	// Changes the status of all the game sessions of a user
	// (Useful when user disconnects so we can set him as waiting everywhere at once)
	private async setAllUserGameSessionsTo(
		userId: number,
		newStatus: PlayerGameStatus,
	): Promise<void> {
		await this.prisma.gameSession.updateMany({
			where: {
				userId: userId,
			},
			data: {
				playerStatus: newStatus,
			},
		});
	}
}
