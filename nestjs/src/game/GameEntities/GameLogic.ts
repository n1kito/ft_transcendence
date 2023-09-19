import Ball from "./Ball";
import Paddle from "./Paddle";

export class GameLogic {

	public paddlePlayer: Paddle;
	public paddleOpponent: Paddle;
	public ball: Ball;

	public playerScore: number = 0;
	public opponentScore: number = 0;

	public canvasSize = { width: 700, height: 500 };
	public paddleWidth = 5;
	public paddleHeight = this.canvasSize.height * 0.2;
	public ballSize = 15;

	constructor() {

		// Create player1 paddle
		this.paddlePlayer = new Paddle(
			0,
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			this.paddleWidth,
			this.paddleHeight,
		);
		// Create opponent paddle
		this.paddleOpponent = new Paddle(
			this.canvasSize.width - this.paddleWidth,
			0,
			this.paddleWidth,
			this.canvasSize.height,
		);
		// Create ball
		this.ball = new Ball(
			this.canvasSize.width / 2 - this.ballSize / 2,
			this.canvasSize.height / 2 - this.ballSize / 2,
			this.ballSize,
			this.ballSize,
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
