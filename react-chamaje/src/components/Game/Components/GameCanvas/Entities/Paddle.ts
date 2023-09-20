import { IPlayerState } from '../../../../../../../shared-lib/types/game';
import { GameEntity } from './Shared';

export default class Paddle extends GameEntity {
	private speed: number = 25;
	private direction: number;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
		this.direction = 0;
	}

	update(canvasSize: { width: number; height: number }) {
		const screenPaddleGap: number = 0.075 * canvasSize.height;
		// Calculate the new y coordinate of the paddle
		this.y += this.speed * this.direction;
		// Make sure the y coordinates are never < 0 or > canvasHeight - paddleHeight
		// However, to respect the original 1972 game, the paddles leave a gap at the top and the bottom of the playground,
		// to avoid infinite matches
		this.y = Math.max(
			screenPaddleGap,
			// TODO: check the use of ! for conditionals. This should never be undefined so I don't see why it's typed as such
			Math.min(this.y, canvasSize.height - this.height - screenPaddleGap),
		);
	}

	setDirection(direction: string) {
		if (direction === 'up') this.direction = -1;
		else if (direction === 'down') this.direction = 1;
		else this.direction = 0;
	}

	serverUpdate(playerState: IPlayerState) {
		this.x = playerState.x;
		this.y = playerState.y;
		this.width = playerState.width;
		this.height = playerState.height;
	}
}
