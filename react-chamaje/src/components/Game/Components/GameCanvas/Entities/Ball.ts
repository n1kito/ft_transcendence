import { GameEntity } from './Shared';
import Paddle from './Paddle';
import { IBallState } from '../../../../../../../shared-lib/types/game';

export default class Ball extends GameEntity {
	// Speed is how many pixels the ball should move in one second
	// Since our canvas is 700 pixels wide we will put 500 base speed
	private BASE_SPEED: number = 300;
	private MAX_SPEED: number = 450;
	private speed: number = this.BASE_SPEED;
	private xVelocity: number = 0;
	private yVelocity: number = 0;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);

		// // give the ball a random initial direction
		// let coinToss = Math.floor(Math.random() * 2) + 1;
		// // TODO: this should be decided by the server, otherwise each player will start
		// // the game with the ball going in a different direction
		// this.xVelocity = coinToss === 1 ? 1 : -1;
		// // the ball will always start by going down
		// this.yVelocity = 1;

		// The ball will always go to the player on the right
		// TODO: if we want this to be different we need to sync it from the server
		// to the client, otherwise each client and server logic can have different
		// starting directions
		this.xVelocity = 1;
		// the ball will always start by going down
		this.yVelocity = 1;
	}

	update(
		playerPaddle: Paddle,
		opponentPaddle: Paddle,
		canvasSize: { width: number; height: number },
		playerScored: (won: boolean) => void,
		timeBetweenTwoFrames: number,
	) {
		const canvasHeight = canvasSize.height;
		const canvasWidth = canvasSize.width;
		const canvasCenter = canvasWidth / 2 - this.width / 2;

		// update the position of the ball
		this.x += timeBetweenTwoFrames * this.xVelocity * this.speed;
		this.y += timeBetweenTwoFrames * this.yVelocity * this.speed;

		// checking for any collisions
		// we always check for the ball's direction, so it never gets stuck
		// we always check for a paddle collision before a wall collision, so we never miss it

		// check for top collision
		if (this.yVelocity < 0 && this.y <= 0) {
			console.log('top collision');
			this.yVelocity *= -1;
		}
		// check for bottom collision
		else if (this.yVelocity > 0 && this.y + this.height >= canvasHeight) {
			console.log('bottom collision');
			this.yVelocity *= -1;
		}
		// check for self-paddle collision
		else if (
			this.xVelocity < 0 &&
			this.rectangleIntersection(this, playerPaddle)
		) {
			console.log('hit my own paddle');
			this.handlePaddleCollision(playerPaddle);
		}
		// check for left collision
		// on collision, the ball goes to the middle of the court, goes back to base speed and the player loses a point
		else if (this.xVelocity < 0 && this.x <= 0) {
			console.log('lost a point');
			this.speed = this.BASE_SPEED;
			this.x = canvasCenter;
			playerScored(false);
		}
		// check for right paddle collision
		else if (
			this.xVelocity > 0 &&
			this.rectangleIntersection(this, opponentPaddle)
		) {
			console.log('opponent paddle collision');
			this.handlePaddleCollision(opponentPaddle);
		}
		// // check for right collision
		// // on collision, ball goes to the center of the cour, goes back to base speed and player scores a point
		else if (this.xVelocity > 0 && this.x + this.width >= canvasWidth) {
			console.log('scored a point');
			this.speed = this.BASE_SPEED;
			this.x = canvasCenter;
			playerScored(true);
		}
	}

	private rectangleIntersection(ball: Ball, paddle: Paddle) {
		const ballShape = {
			x: ball.x,
			y: ball.y,
			width: ball.width,
			height: ball.height,
		};
		const paddleShape = {
			x: paddle.x,
			y: paddle.y,
			width: paddle.width,
			height: paddle.height,
		};

		// Check x and y for overlap
		if (
			paddleShape.x > ballShape.width + ballShape.x ||
			ballShape.x > paddleShape.width + paddleShape.x ||
			paddleShape.y > ballShape.height + ballShape.y ||
			ballShape.y > paddleShape.height + paddleShape.y
		)
			return false;
		return true;
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
