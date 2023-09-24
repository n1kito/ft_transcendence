// Shared entities needed for the other game files

export enum PaddleDirection {
	up,
	down,
	immobile,
}

export class GameEntity {
	x: number;
	y: number;
	width: number;
	height: number;
	targetX = -1;
	targetY = -1;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	draw(context: CanvasRenderingContext2D): void {
		// setup the visual style
		context.fillStyle = 'white';
		// context.strokeStyle = 'white';
		// context.lineWidth = 1;
		context.shadowColor = 'white';
		context.shadowBlur = 40;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;

		// TODO: this interpolates even when the ball is going to the center
		// whih looks awful, but not sure how to track whether the ball
		// needs to go back after score changes
		this.interpolate();

		// draw the entity
		context.fillRect(this.x, this.y, this.width, this.height);
		// context.strokeRect(this.x, this.y, this.width, this.height);
	}

	// interpolate() {
	// 	if (this.targetX) this.x += (this.targetX - this.x) * 0.5;
	// 	if (this.targetY) this.y += (this.targetY - this.y) * 0.5;
	// }

	interpolate() {
		if (this.targetX >= 0) {
			// const diffX = Math.abs(this.targetX - this.x); // Calculate the absolute difference
			// if (diffX <= 50) {
			// Check if the difference is not greater than 200
			this.x += (this.targetX - this.x) * 0.5;
			// }
		}

		if (this.targetY >= 0) {
			// const diffY = Math.abs(this.targetY - this.y); // Calculate the absolute difference
			// if (diffY <= 50) {
			// Check if the difference is not greater than 200
			this.y += (this.targetY - this.y) * 0.5;
			// }
		}
	}
}
