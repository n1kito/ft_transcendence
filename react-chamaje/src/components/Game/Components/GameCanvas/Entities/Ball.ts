import { GameEntity } from './Shared';
import Paddle from './Paddle';
import { IBallState } from '../../../../../../../shared-lib/types/game';

export default class Ball extends GameEntity {
	private BASE_SPEED: number = 6;
	private MAX_SPEED: number = 8;
	private speed: number = this.BASE_SPEED;
	private xVelocity: number = 0;
	private yVelocity: number = 0;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);

		// give the ball a random initial direction
		let coinToss = Math.floor(Math.random() * 2) + 1;
		// TODO: this should be decided by the server, otherwise each player will start
		// the game with the ball going in a different direction
		this.xVelocity = coinToss === 1 ? 1 : -1;
		// the ball will always start by going down
		this.yVelocity = 1;
	}

	update(
		playerPaddle: Paddle,
		opponentPaddle: Paddle,
		canvasSize: { width: number; height: number },
		playerScored: (won: boolean) => void,
	) {
		// ball predicted ghost shape
		const ghostShape = {
			x: Math.min(this.x, this.x + this.xVelocity * this.speed),
			y: Math.min(this.y, this.y + this.yVelocity * this.speed),
			width: this.width + Math.abs(this.xVelocity * this.speed),
			height: this.height + Math.abs(this.yVelocity * this.speed),
		};

		const canvasHeight = canvasSize.height;
		const canvasWidth = canvasSize.width;

		const canvasCenter = canvasWidth / 2 - this.width / 2;

		// check for top collision
		// on collision make the ball go down
		if (this.y <= 0) {
			// console.log('top collision');
			this.yVelocity = 1;
		}
		// check for bottom collision
		// on collision make the ball go up
		else if (this.y + this.height >= canvasHeight) {
			// console.log('bottom collision');
			this.yVelocity = -1;
		}

		// check for left collision
		// on collision, the ball goes to the middle of the court and the player loses a point
		if (this.x <= 0) {
			// console.log('lost a point');
			this.x = canvasCenter;
			this.speed = this.BASE_SPEED;
			playerScored(false);
		}
		// check for right collision
		// on collision, ball goes to the center of the court and player scores a point
		else if (this.x + this.width >= canvasWidth) {
			// console.log('scored a point');
			this.x = canvasCenter;
			this.speed = this.BASE_SPEED;
			playerScored(true);
		}
		// check for self-paddle collision
		// if (this.x <= playerPaddle.x + playerPaddle.width) {
		else if (this.rectangleIntersection(ghostShape, playerPaddle)) {
			// console.log('hit my own paddle');
			// Put the ball on the paddle
			this.x = playerPaddle.x + playerPaddle.width;
			// Update its direction and speed depending on where the ball his the paddle
			this.handlePaddleCollision(playerPaddle);
		} else if (this.rectangleIntersection(ghostShape, opponentPaddle)) {
			// console.log('opponent paddle collision');
			// Put the ball on the paddle
			this.x = opponentPaddle.x - this.width;
			// chack for opponent paddle collision
			this.handlePaddleCollision(opponentPaddle);
		} else {
			// update the position of the ball
			this.x += this.xVelocity * this.speed;
			this.y += this.yVelocity * this.speed;
		}
	}

	private rectangleIntersection(
		ghostShape: { x: number; y: number; width: number; height: number },
		paddle: Paddle,
	) {
		const paddleShape = {
			x: paddle.x,
			y: paddle.y,
			width: paddle.width,
			height: paddle.height,
		};
		return (
			ghostShape.x < paddleShape.x + paddleShape.width &&
			ghostShape.x + ghostShape.width > paddleShape.x &&
			ghostShape.y < paddleShape.y + paddleShape.height &&
			ghostShape.y + ghostShape.height > paddleShape.y
		);
	}

	private handlePaddleCollision(paddle: Paddle) {
		// Find out where the ball hit the paddle
		const relativeIntersectY = paddle.y + paddle.height / 2 - this.y;

		// Let's decide an angle base on that hit position
		// with a maximum of 75 degrees
		const maxBounceAngle = 75 * (Math.PI / 180);
		const relativeIntersectPercentage =
			relativeIntersectY / (paddle.height / 2);
		const bounceAngle = relativeIntersectPercentage * maxBounceAngle;

		this.yVelocity = -Math.sin(bounceAngle);

		// Reverse the ball's horizontal direction
		this.xVelocity *= -1;

		// Speed up the ball proportionally to our far it is from the center of the paddle
		const speedMultiplier = Math.abs(relativeIntersectPercentage);
		const speedIncrease = speedMultiplier * (this.MAX_SPEED - this.speed);
		this.speed += speedIncrease;
		if (this.speed > this.MAX_SPEED) this.speed = this.MAX_SPEED;
	}

	serverUpdate(newState: IBallState) {
		this.x = newState.x;
		this.y = newState.y;
		this.width = newState.width;
		this.height = newState.height;
	}
}
