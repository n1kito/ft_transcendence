import Paddle from './Paddle';
import Ball from './Ball';
import {
	IGameState,
	IPlayerMovementPayload,
	IPlayerState,
} from '../../../../../../../shared-lib/types/game';
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
	latestInputId = 0;

	// private frontEndPLayers = {};

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

	gameStateServerUpdate(newState: IGameState | undefined) {
		if (!newState) return;

		// Update our player's position according to our received state
		// which is most likely in the past, compared to where we are at right now
		this.paddlePlayer.serverUpdate(newState.player1);

		console.log('received sequenceid:', newState.inputSequenceId);

		// Find the index of the last event that the server processed
		const lastTreatedInputIndex = this.untreatedInputs.findIndex((input) => {
			// Return a condition
			return newState.inputSequenceId === input.inputSequenceId;
		});
		console.log({ lastTreatedInputIndex });
		if (lastTreatedInputIndex > -1)
			// Remove the non-needed inputs from our untreated input history
			this.untreatedInputs.splice(0, lastTreatedInputIndex + 1);
		// And for each remaining input, apply them to that past position we
		// acknowledged from the server, so our player can be positioned in
		// its corrent current state based on its past position and the number
		// of moves it's done
		this.untreatedInputs.forEach((input) => {
			const numberDirection =
				input.direction === 'up' ? -1 : input.direction === 'down' ? 1 : 0;
			// For each remaining action we did after our server update,
			// we update the position relative to the frame rate of our canvas // TODO: I THINK, it's just so fucking confusing
			this.paddlePlayer.y +=
				input.frameRate * this.paddlePlayer.speed * numberDirection;
		});

		// Update the opponent's position
		this.paddleOpponent.serverUpdate(newState.player2);

		// Update the player scores
		this.playerScore = newState.player1.score;
		this.opponentScore = newState.player2.score;

		// Update the ball
		this.ball.serverUpdate(newState.ball);
	}

	updateElementsState(timeBetweenTwoFrames: number): void {
		this.paddlePlayer.update(this.canvasSize, timeBetweenTwoFrames);
		this.paddleOpponent.update(this.canvasSize, timeBetweenTwoFrames);
		this.ball.update(
			this.paddlePlayer,
			this.paddleOpponent,
			this.canvasSize,
			this.handleScoreUpdate,
			timeBetweenTwoFrames,
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
