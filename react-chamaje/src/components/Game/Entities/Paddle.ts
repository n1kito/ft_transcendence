export class Paddle {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	direction: number; // -1 for up, +1 for down

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = 12;
		this.direction = 0; // Stationary by default
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}

	move(canvas: HTMLCanvasElement): void {
		// Calculate the new y coordinate of the paddle
		this.y += this.speed * this.direction;
		// Make sure the y coordinates are never < 0 or > canvasHeight - paddleHeight
		this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
	}
}
