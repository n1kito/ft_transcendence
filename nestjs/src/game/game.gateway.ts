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
// import { GameRoomStatus, PlayerGameStatus, gameRoom } from '@prisma/client';

interface IRoomInformationProps {
	id: number;
	state: string;
}

// interface IGameInformationProps {
// 	gameRoomId: number;
// 	opponentLogin: string;
// 	opponentImage: string;
// }

// TODO:
// - When a player disconnects in the middle of a game, do we make him leave the room ?

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

	/*
	░█░░░▀█▀░█▀▀░█▀▀░█▀▀░█░█░█▀▀░█░░░█▀▀░
	░█░░░░█░░█▀▀░█▀▀░█░░░░█░░█░░░█░░░█▀▀░
	░▀▀▀░▀▀▀░▀░░░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀░
	*/

	async afterInit(server: Server) {
		console.log('[🦄] Server initialized !');
		this.gameService.setServer(this.server);
	}

	/*
	░█▀▀░█▀█░█▀█░█▀█░█▀▀░█▀▀░▀█▀░▀█▀░█▀█░█▀█░
	░█░░░█░█░█░█░█░█░█▀▀░█░░░░█░░░█░░█░█░█░█░
	░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░
	*/

	handleConnection(clientSocket: Socket) {
		this.gameService.handleNewClientConnection(clientSocket);
	}

	async handleDisconnect(clientSocket: any) {
		this.gameService.handleClientDisconnect(clientSocket);
	}

	/*
	░█▀▄░█▀█░█▀█░█▄█░█▀▀
	░█▀▄░█░█░█░█░█░█░▀▀█
	░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀
	*/

	// This will look for a room for the user, join the room and add them to the corresponding
	// socket room, so they can receive updates. The user will received the roomId so they
	// know how to communicate to it as well.
	// @SubscribeMessage('join-room')
	// async joinRoom(
	// 	socket: Socket,
	// 	data: { userId: number; opponentId: number | undefined },
	// ) {
	// 	try {
	// 		this.gameService.handleJoinRoom(socket, data.userId, data.opponentId);
	// 	} catch (error) {
	// 		console.error('Could not join game room: ', error);
	// 		socket.emit('error-joining-room');
	// 	}
	// }

	/*
	░█▀▀░█▀█░█▄█░█▀▀░░░█▀█░█▀▀░▀█▀░▀█▀░█▀█░█▀█░█▀▀
	░█░█░█▀█░█░█░█▀▀░░░█▀█░█░░░░█░░░█░░█░█░█░█░▀▀█
	░▀▀▀░▀░▀░▀░▀░▀▀▀░░░▀░▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀
	*/

	@SubscribeMessage('player-is-ready')
	handlePlayerIsReady(clientSocket: Socket) {
		this.gameService.broadcastPlayerIsReady(clientSocket);
		this.gameService.setPlayerAsReady(clientSocket);
	}

	@SubscribeMessage('player-moved')
	handlePlayerMovement(
		clientSocket: Socket,
		{ direction }: { direction: 'up' | 'down' | 'immobile' },
	) {
		this.gameService.handlePlayerMovement(clientSocket, direction);
	}

	// // Send users their opponent's information
	// @SubscribeMessage('request-opponent-info')
	// async handleOpponentInfoRequest(
	// 	client: any,
	// 	data: { userId: number; roomId: string },
	// ) {
	// 	const { userId, roomId } = data;
	// 	// Retrieve our opponent's information
	// 	const opponentInformation: { login: string; image: string } =
	// 		await this.gameService.getOpponentInformation(userId, roomId);
	// 	// Send it back to our user
	// 	client.emit('server-opponent-info', opponentInformation);
	// }

	// // TODO: this should be try/catched
	// // Player notifies that it's ready
	// @SubscribeMessage('player-is-ready')
	// async handlePlayerIsReady(
	// 	client: Socket,
	// 	data: { userId: number; roomId: string },
	// ) {
	// 	const { userId, roomId } = data;
	// 	// Update the database gameSession entry
	// 	await this.gameService.DBUpdatePlayerReadyStatus(userId, roomId, true);
	// 	// Notify the other users in the room that their opponent is ready
	// 	client.to(roomId).emit('opponent-is-ready');
	// }

	// // Handle when player asks to be removed from their current room
	// @SubscribeMessage('leave-current-room')
	// async handlePlayerLeavesRoom(data: { userId: number }) {
	// 	console.log(
	// 		`[🧹] Player ${data.userId} asked to be removed from their active room`,
	// 	);
	// 	this.gameService.removePlayerFromOpponentRooms(data.userId);
	// }

	// @SubscribeMessage('paddle-movement')
	// async handlePaddleUp(
	// 	clientSocket: Socket,
	// 	data: { playerNumber: number; direction: string },
	// ) {
	// 	const { playerNumber, direction } = data;
	// 	console.log(`[🎮] Player ${playerNumber} moved their paddle ${direction}`);
	// 	this.gameService.handlePlayerMovement
	// }
}
