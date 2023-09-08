import { Paddle } from './Paddle';

export class Ball {
	x: number;
	y: number;
	radius: number;
	speed: number;
	dx: number; // change in X direction
	dy: number; // change in Y direction

	// TODO: if it's the beginning of a "manche" I want the ball
	// to be located on the Paddle of the beginning player
	constructor(x: number, y: number, radius: number) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.speed = 7;

		// Set an initial direction for the ball
		// this.dx = this.speed;
		this.dx = this.speed;
		this.dy = -this.speed;
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath(); // Start a new drawing path
		// ctx.fillStyle = 'white';
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
	}

	move(): void {
		this.x += this.dx;
		this.y += this.dy;
	}

	// Checks if the ball has collided with a paddle and reverses its direction accordingly
	paddleBounceCheck(paddle: Paddle, side: 'left' | 'right'): boolean {
		if (
			this.y + this.radius > paddle.y && // Ball bottom is below paddle top edge
			this.y - this.radius < paddle.y + paddle.height
		) {
			// Ball top is above paddle's bottom edge
			if (
				side === 'left' &&
				this.x - this.radius < paddle.x + paddle.width && // Ball left side is on the left of the paddle's right side
				this.x + this.radius > paddle.x // Ball right side is on the right of the paddle's left side)
			) {
				this.dx *= -1;
				// console.log('Collision with left paddle');
				return true;
			} else if (
				side === 'right' &&
				this.x + this.radius > paddle.x && // Ball right side is on the right of the paddle's left side
				this.x - this.radius < paddle.x + paddle.width // Ball left side is on the left of the paddle's right side)
			) {
				this.dx *= -1;
				// console.log('Collision with right paddle');
				return true;
			}
		}
		return false;
	}

	// Check if the ball has collided with a wall and changes its direction accordingly
	wallCollisionCheck(canvas: HTMLCanvasElement): void {
		// If the ball hits the top or bottom of the canvas
		if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
			this.dy = -this.dy;
		}

		// If the ball hits the left or right (this would be a point in Pong)
		// Note: You might want to handle scoring or reset the ball position here
		if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
			this.dx = -this.dx;
			// console.log('someone scored !');
		}
	}
}
