import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	WebSocketServer,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { IPlayerMovementPayload } from 'shared-lib/types/game';

@WebSocketGateway({
	path: '/ws/',
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(
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

	async handleConnection(clientSocket: Socket) {
		try {
			await this.gameService.handleNewClientConnection(clientSocket);
		} catch (error) {
			console.error('[⚠️ ] handleConnection():', error.message);
		}
	}

	async handleDisconnect(clientSocket: any) {
		try {
			this.gameService.handleClientDisconnect(clientSocket);
		} catch (error) {
			console.error('[⚠️ ] handleDisconnect:', error.message);
		}
	}

	/*
	░█▀▀░█▀█░█▄█░█▀▀░░░█▀█░█▀▀░▀█▀░▀█▀░█▀█░█▀█░█▀▀
	░█░█░█▀█░█░█░█▀▀░░░█▀█░█░░░░█░░░█░░█░█░█░█░▀▀█
	░▀▀▀░▀░▀░▀░▀░▀▀▀░░░▀░▀░▀▀▀░░▀░░▀▀▀░▀▀▀░▀░▀░▀▀▀
	*/

	@SubscribeMessage('player-is-ready')
	handlePlayerIsReady(clientSocket: Socket) {
		try {
			this.gameService.broadcastPlayerIsReady(clientSocket);
			this.gameService.setPlayerAsReady(clientSocket);
		} catch (error) {
			console.error('[⚠️ ] handlePlayerIsReady():', error.message);
		}
	}

	@SubscribeMessage('player-moved')
	handlePlayerMovement(clientSocket: Socket, payload: IPlayerMovementPayload) {
		try {
			this.gameService.handlePlayerMovement(clientSocket, payload.direction);
		} catch (error) {
			console.error('[⚠️ ] handlePlayerMovement():', error.message);
		}
	}

	@SubscribeMessage('user-wants-new-opponent')
	async handleUserWantsNewOpponent(clientSocket: Socket) {
		try {
			await this.gameService.handleUserWantsNewOpponent(clientSocket);
		} catch (error) {
			console.error('[⚠️ ] handleUserWantsNewOpponent():', error.message);
		}
	}

	@SubscribeMessage('powerup-setting-update')
	handlePowerupSettingUpdate(
		clientSocket: Socket,
		userDisabledPowerups: boolean,
	) {
		try {
			this.gameService.handlePowerupSettingUpdate(
				clientSocket,
				userDisabledPowerups,
			);
		} catch (error) {
			console.error('[⚠️ ] handlePowerupSettingUpdate():', error.message);
		}
	}

	@SubscribeMessage('power-up-activated')
	handlePowerupActivated(clientSocket: Socket) {
		try {
			this.gameService.handlePowerupActivated(clientSocket);
		} catch (error) {
			console.error('[⚠️ ] handlePowerupActivated():', error.message);
		}
	}
}
