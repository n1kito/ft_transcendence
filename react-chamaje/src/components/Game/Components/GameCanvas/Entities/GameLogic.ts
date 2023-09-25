import Paddle from './Paddle';
import Ball from './Ball';
import {
	IGameState,
	IPlayerMovementPayload,
} from '../../../../../../shared-lib/types/game';
import PowerUp from './PowerUp';

// import { ICurrentGameState } from '@sharedTypes/game';
export class GameLogic {
	public paddlePlayer: Paddle;
	public paddleOpponent: Paddle;
	public ball: Ball;

	public playerScore = 0;
	public opponentScore = 0;

	public canvasSize: { width: number; height: number };

	public broadcastPlayerPosition: (payload: IPlayerMovementPayload) => void;

	constructor(
		canvasSize: { width: number; height: number },
		broadcastPlayerPosition: (payload: IPlayerMovementPayload) => void,
	) {
		this.canvasSize = canvasSize;

		// Init default values
		const paddleWidth = 5;
		const paddleHeight = canvasSize.height * 0.2;
		const ballSize = 10;
		this.broadcastPlayerPosition = broadcastPlayerPosition;

		// Create player1 paddle
		this.paddlePlayer = new Paddle(
			0,
			this.canvasSize.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
		);
		// Create opponent paddle
		this.paddleOpponent = new Paddle(
			this.canvasSize.width - paddleWidth,
			this.canvasSize.height / 2 - paddleHeight / 2,
			paddleWidth,
			paddleHeight,
		);
		// Create ball
		this.ball = new Ball(
			this.canvasSize.width / 2 - ballSize / 2,
			this.canvasSize.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);
	}

	gameStateServerUpdate(serverState: IGameState | undefined) {
		if (!serverState) return;

		// Find out if the score changed
		let scoreChanged =
			this.playerScore != serverState.player1.score ||
			this.opponentScore != serverState.player2.score;

		// Update ball position
		this.ball.update(serverState.ball, scoreChanged);

		// Apply the server state to the opponent's paddle with interpolation
		this.paddlePlayer.update(serverState.player1);
		this.paddleOpponent.update(serverState.player2);

		// Update the scores
		this.playerScore = serverState.player1.score;
		this.opponentScore = serverState.player2.score;
	}

	handleScoreUpdate = (won: boolean) => {
		if (won) this.playerScore++;
		else this.opponentScore++;
	};

	log(message: string): void {
		console.log(
			`%c GameLogic %c ${message}`,
			'background:orange;color:yellow',
			'',
		);
	}
}
