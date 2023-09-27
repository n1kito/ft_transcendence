import { GameEntity } from './Shared';

export default class Paddle extends GameEntity {
	// private speed: number = 800;
	private BASE_SPEED = 15;
	private BASE_HEIGHT;
	speed: number = this.BASE_SPEED;
	private direction: number;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
		this.BASE_HEIGHT = this.height;
		this.direction = 0;
	}

	update(
		canvasSize: { width: number; height: number },
		// timeBetweenTwoFrames: number,
	) {
		const screenPaddleGap: number = 0.03 * canvasSize.height;
		// Calculate the new y coordinate of the paddle
		this.y += this.speed * this.direction; /* * timeBetweenTwoFrames */
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

	resetSpeed() {
		this.speed = this.BASE_SPEED;
	}

	resetHeight() {
		this.height = this.BASE_HEIGHT;
	}
}
