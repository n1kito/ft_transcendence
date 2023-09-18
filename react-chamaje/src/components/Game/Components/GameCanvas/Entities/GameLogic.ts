import Paddle from './Paddle';
import Ball from './Ball';
import { ICurrentGameState } from '../../../../../../shared-lib/types/game-types';

export class GameLogic {
	private TICK_RATE = 1000 / 60; // we want 60 updates per second (in milliseconds, so we can use the value with Date.now()
	private lastTick = Date.now();
	public inputSequenceNumber = 0; // this is used to track the number of each client input
	// used to store all of the inputs that have not been confirmed by the server yet
	public unconfirmedInputs: Array<{
		sequenceNumber: number;
		direction: string;
	}> = [];

	public paddlePlayer: Paddle;
	public paddleOpponent: Paddle;
	public ball: Ball;

	public playerScore: number = 0;
	public opponentScore: number = 0;

	public canvasSize: { width: number; height: number };

	public broadcastPlayerPosition: (
		direction: string,
		inputSequenceNumber: number,
	) => void;

	constructor(
		canvasSize: { width: number; height: number },
		broadcastPlayerPosition: (
			direction: string,
			inputSequenceNumber: number,
		) => void,
	) {
		this.canvasSize = canvasSize;

		// Init default values
		const paddleWidth = 5;
		const paddleHeight = canvasSize.height * 0.2;
		const ballSize = 15;
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
			0,
			paddleWidth,
			this.canvasSize.height,
		);
		// Create ball
		this.ball = new Ball(
			this.canvasSize.width / 2 - ballSize / 2,
			this.canvasSize.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);
	}

	updateGameState(): void {
		let dateNow = Date.now();
		let timeSinceLastTick = dateNow - this.lastTick;

		if (timeSinceLastTick >= this.TICK_RATE) {
			this.updateElementsState();
			this.lastTick = dateNow - (timeSinceLastTick % this.TICK_RATE);
			// this.log(`Scores: ${this.playerScore}/${this.opponentScore}`);
		}
		this.updateElementsState();
	}

	updateElementsState(): void {
		this.paddlePlayer.update(this.canvasSize);
		this.paddleOpponent.update(this.canvasSize);
		this.ball.update(
			this.paddlePlayer,
			this.paddleOpponent,
			this.canvasSize,
			this.handleScoreUpdate,
		);
	}

	handleScoreUpdate = (won: boolean) => {
		if (won) this.playerScore++;
		else this.opponentScore++;
	};
}
