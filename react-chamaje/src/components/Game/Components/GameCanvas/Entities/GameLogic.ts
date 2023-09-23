import Paddle from './Paddle';
import Ball from './Ball';
import {
	IGameState,
	IPlayerMovementPayload,
} from '../../../../../../shared-lib/types/game';

// import { ICurrentGameState } from '@sharedTypes/game';
export class GameLogic {
	private TICK_RATE = 1000 / 60; // we want 60 updates per second (in milliseconds, so we can use the value with Date.now()
	private lastTick = Date.now();
	public inputSequenceId = 0; // this is used to track the number of each client input

	// used to store all of the inputs that have not been confirmed by the server yet
	// public unconfirmedInputs: Array<{
	// 	sequenceNumber: number;
	// 	direction: string;
	// }> = [];
	untreatedInputs: IPlayerMovementPayload[] = [];

	// private frontEndPLayers = {};
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

		// Update the score
		let scoreChanged =
			this.playerScore != serverState.player1.score ||
			this.opponentScore != serverState.player2.score;
		this.playerScore = serverState.player1.score;
		this.opponentScore = serverState.player2.score;

		// Find the index of the last event that the server processed
		const lastTreatedInputIndex = this.untreatedInputs.findIndex((input) => {
			// Return a condition
			return serverState.inputSequenceId === input.inputSequenceId;
		});
		if (lastTreatedInputIndex > -1) {
			// Remove the non-needed inputs from our untreated input history
			this.untreatedInputs.splice(0, lastTreatedInputIndex + 1);
		}

		// And for each remaining input, apply them to that past position we
		// acknowledged from the server, so our player can be positioned in
		// its corrent current state based on its past position and the number
		// of moves it's done
		this.paddlePlayer.targetY = serverState.player1.y;
		// If we see a score, we apply the server position directly so the ball
		// goes to the middle of the canvas with no interpolation
		if (scoreChanged) {
			this.ball.x = this.ball.targetX = serverState.ball.x;
			this.ball.y = this.ball.targetY = serverState.ball.y;
			scoreChanged = false;
		} else {
			this.ball.targetX = serverState.ball.x;
			this.ball.targetY = serverState.ball.y;
		}

		// For each remaining action we did after our server update,
		// we update the position of our paddle and the ball
		this.untreatedInputs.forEach((input) => {
			// const numberDirection =
			input.direction === 'up' ? -1 : input.direction === 'down' ? 1 : 0;
			// this.paddlePlayer.targetY += this.paddlePlayer.speed * numberDirection;
			// this.ball.targetX += input.ballSpeed * input.ballXVelocity;
			// this.ball.targetY += input.ballSpeed * input.ballYVelocity;
		});

		// Apply the server state to the opponent's paddle with interpolation
		this.paddleOpponent.serverUpdate(serverState.player2);

		// Update the scores
		this.playerScore = serverState.player1.score;
		this.opponentScore = serverState.player2.score;
	}

	updateBallPosition(): void {
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
