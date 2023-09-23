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
import { IPlayerMovementPayload } from 'shared-lib/types/game';

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
	handlePlayerMovement(clientSocket: Socket, payload: IPlayerMovementPayload) {
		this.gameService.handlePlayerMovement(
			clientSocket,
			payload.direction,
			payload.inputSequenceId,
		);
	}

}
