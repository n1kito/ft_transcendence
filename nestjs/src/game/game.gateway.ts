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
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { TokenService } from 'src/token/token.service';
import webSocketRateLimit from './GameEntities/RateLimit';
@WebSocketGateway({ path: '/ws/game' })
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(
		private readonly prisma: PrismaService,
		private readonly tokenService: TokenService,
		private readonly gameService: GameService,
	) {
		// webSocketRateLimiter('10s', 100);
	}

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
		// verify if user is authenticated
		const token = clientSocket.handshake.auth.accessToken;
		if (!token) {
			console.error('token not found');
			clientSocket.disconnect();
		}

		try {
			this.tokenService.verifyToken(token);
			this.gameService.handleNewClientConnection(clientSocket).then(() => {});
		} catch (error) {
			console.error('handleConnection():', error.message);
			clientSocket.disconnect();
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
			// watch `player-moved` messages rate
			webSocketRateLimit.protect(this.server, clientSocket);
			this.gameService.handlePlayerMovement(clientSocket, payload.direction);
		} catch (error) {
			console.error('handlePlayerMovement():', error.message);
			// clientSocket.disconnect();
			clientSocket.emit('error', error.message);
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
