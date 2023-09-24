import Paddle from './Paddle';
import Ball from './Ball';
import {
	IGameState,
	IPlayerMovementPayload,
} from '../../../../../../shared-lib/types/game';

// import { ICurrentGameState } from '@sharedTypes/game';
export class GameLogic {
	public inputSequenceId = 0; // this is used to track the number of each client input

	untreatedInputs: IPlayerMovementPayload[] = [];

	// private frontEndPLayers = {};
	public paddlePlayer: Paddle;
	public paddleOpponent: Paddle;
	public ball: Ball;

	public playerScore = 0;
	public opponentScore = 0;

	public canvasSize: { width: number; height: number };

	public deltaTime = 0;

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

		// Find the index of the last event that the server processed
		const lastTreatedInputIndex = this.untreatedInputs.findIndex((input) => {
			return serverState.inputSequenceId === input.inputSequenceId;
		});
		// Remove the non-needed inputs from our untreated input history
		if (lastTreatedInputIndex > -1) {
			this.untreatedInputs.splice(0, lastTreatedInputIndex + 1);
		}

		// And for each remaining input, apply them to that past position we
		// acknowledged from the server, so our player can be positioned in
		// its corrent current state based on its past position and the number
		// of moves it's done
		this.paddlePlayer.targetY = serverState.player1.y;
		// For each remaining action we did after our server update,
		// we update the position of our paddle and the ball
		this.untreatedInputs.forEach((input) => {
			const numberDirection =
				input.direction === 'up' ? -1 : input.direction === 'down' ? 1 : 0;
			const screenPaddleGap: number = 0.05 * this.canvasSize.height;
			const newTargetY =
				this.paddlePlayer.targetY +
				this.paddlePlayer.speed * numberDirection * this.deltaTime;
			this.paddlePlayer.targetY = Math.max(
				screenPaddleGap,
				Math.min(
					newTargetY,
					this.canvasSize.height - this.paddlePlayer.height - screenPaddleGap,
				),
			);
		});

		// Only interpolate with targetX/Y if the score has not changed
		// or the distance between both is not too high,
		// otherwise the ball slides accross the entire screen
		if (scoreChanged || Math.abs(this.ball.x - serverState.ball.x) > 20) {
			this.ball.x = this.ball.targetX = serverState.ball.x;
			this.ball.y = this.ball.targetY = serverState.ball.y;
		} else {
			this.ball.targetX = serverState.ball.x;
			this.ball.targetY = serverState.ball.y;
		}
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
			this.deltaTime,
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
