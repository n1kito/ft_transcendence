import {
	IPlayerMovementPayload,
	IPlayerState,
} from '../../../../../../../shared-lib/types/game';
import { GameEntity } from './Shared';

export default class Paddle extends GameEntity {
	// speed: number = 800;
	// speed: number = 800;
	speed: number = 8;
	// targetY: number | undefined;
	private direction: number;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
		this.direction = 0;
	}

	setDirection(direction: string) {
		if (direction === 'up') this.direction = -1;
		else if (direction === 'down') this.direction = 1;
		else this.direction = 0;
	}

	getDirection(): IPlayerMovementPayload['direction'] {
		if (this.direction == -1) return 'up';
		else if (this.direction == 1) return 'down';
		else return 'immobile';
	}

	update(playerState: IPlayerState) {
		// TODO: add speed to server update if we want that powerup
		this.targetX = playerState.x;
		this.targetY = playerState.y;
		this.width = playerState.width;
		this.height = playerState.height;
	}

	predictPosition(direction: string) {
		const screenPaddleGap: number = 0.03 * 500;
		// Calculate the new y coordinate of the paddle
		this.y += this.speed * this.direction; /* * timeBetweenTwoFrames */
		// Make sure the y coordinates are never < 0 or > canvasHeight - paddleHeight
		// However, to respect the original 1972 game, the paddles leave a gap at the top and the bottom of the playground,
		// to avoid infinite matches
		this.y = Math.max(
			screenPaddleGap,
			// TODO: check the use of ! for conditionals. This should never be undefined so I don't see why it's typed as such
			Math.min(this.y, 500 - this.height - screenPaddleGap),
		);
	}
}
