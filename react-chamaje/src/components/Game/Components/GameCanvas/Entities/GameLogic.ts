import Paddle from './Paddle';
import Ball from './Ball';
import { IGameState } from '../../../../../../../shared-lib/types/game';
// import { ICurrentGameState } from '@sharedTypes/game';

export class GameLogic {
	private TICK_RATE = 1000 / 60; // we want 60 updates per second (in milliseconds, so we can use the value with Date.now()
	private lastTick = Date.now();
	public inputSequenceNumber = 0; // this is used to track the number of each client input
	// used to store all of the inputs that have not been confirmed by the server yet
	public unconfirmedInputs: Array<{
		sequenceNumber: number;
		direction: string;
	}> = [];

	private frontEndPLayers = {};

	public paddlePlayer: Paddle;
	public paddleOpponent: Paddle;
	public ball: Ball;

	public playerScore = 0;
	public opponentScore = 0;

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
			0,
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

	// TODO: let's remove the tick rate for now, it should be handled differently
	updateGameState(): void {
		// let dateNow = Date.now();
		// let timeSinceLastTick = dateNow - this.lastTick;

		// if (timeSinceLastTick >= this.TICK_RATE) {
		// this.updateElementsState();
		// this.lastTick = dateNow - (timeSinceLastTick % this.TICK_RATE);
		// this.log(`Scores: ${this.playerScore}/${this.opponentScore}`);
		// }
		this.updateElementsState();
	}

	gameStateServerUpdate(newState: IGameState | undefined) {
		if (!newState) return;
		// Update the player positions
		this.paddlePlayer.serverUpdate(newState.player1);
		this.paddleOpponent.serverUpdate(newState.player2);

		// Update the player scores
		this.playerScore = newState.player1.score;
		this.opponentScore = newState.player2.score;

		// Update the ball
		this.ball.serverUpdate(newState.ball);
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

	log(message: string): void {
		console.log(
			`%c GameLogic %c ${message}`,
			'background:orange;color:yellow',
			'',
		);
	}
}
