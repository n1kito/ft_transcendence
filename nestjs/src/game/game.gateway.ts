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

@WebSocketGateway({
	path: '/ws/',
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(
		private readonly prisma: PrismaService,
		private readonly gameService: GameService,
	) {}

	afterInit(server: Server) {
		console.log('🦄 Server initialized !');
	}

	handleConnection(client: Socket, ...args: any[]) {
		console.log('🟢 Client connected: ', client.id);
	}

	handleDisconnect(client: Socket) {
		console.log('🔴 Client disconnected:', client.id);
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
	@SubscribeMessage('requestSoloGameRoom')
	async assignSoloGameRoom(
		client: any,
		payload: { userId: number },
	): Promise<{ event: string; data: { gameRoomId: number } }> {
		console.log('Client would like to find a solo room !');

		let assignedRoom;
		const userId = payload.userId;

		// Find an available room the user might already be in
		assignedRoom = await this.gameService.findAvailableRoomUserIsIn(
			payload.userId,
		);
		if (!assignedRoom) {
			// If there are none, find any available room with "Waiting"
			// status that our user is not already in
			assignedRoom = await this.gameService.findRoomWaiting(payload.userId);
			if (!assignedRoom) {
				// If there are no available rooms, create one with our user inside
				assignedRoom = await this.gameService.createRoomWithSingleUser(
					payload.userId,
				);
				if (!assignedRoom)
					// If there is still no room assigned, there was an error somewhere
					throw new Error('Could not assign room to single player');
			}
		}
		return { event: 'assignedGameRoom', data: { gameRoomId: assignedRoom.id } };
	}

	@SubscribeMessage('join room')
	async joinRoom(client: any, data: { userId: number; roomId: number }) {
		// Get a list of how many clients there are in a specific room
		const roomClients = this.server.sockets.adapter.rooms.get(`${data.roomId}`);
		console.log(roomClients);
		const clientsCount = roomClients ? roomClients.size : 0;
		console.log(`Room currently has: ${clientsCount} users in it`);
		// If the room is not already full
		if (clientsCount < 2) {
			// Add the client to it
			client.join(`${data.roomId}`);
			// Find the user in prima
			const userInformation = await this.prisma.user.findUnique({
				where: {
					id: data.userId,
				},
			});
			console.log('User joined room: ', userInformation);
			// And have the user broadcast they information to the other users
			client.broadcast.to(`${data.roomId}`).emit('user joined room', {
				user: {
					login: userInformation.login,
					image: userInformation.image,
				},
			});
			this.server.to(`${data.roomId}`).emit('user joined room', {
				user: {
					login: userInformation.login,
					image: userInformation.image,
				},
			});
			console.log(`client joined room #${data.roomId}`);
		} else client.emit('room error', 'Room is already full !');
	}
}
