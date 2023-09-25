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
		// TODO: this interpolates even when the ball is going to the center
		// whih looks awful, but not sure how to track whether the ball
		// needs to go back after score changes
		this.interpolate();

		// setup the visual style
		context.fillStyle = 'white';
		// context.strokeStyle = 'white';
		// context.lineWidth = 1;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		// draw the entity
		context.shadowColor = 'pink';
		context.shadowBlur = 40;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.shadowColor = 'pink';
		context.shadowBlur = 30;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.shadowColor = 'pink';
		context.shadowBlur = 20;
		context.fillRect(this.x, this.y, this.width, this.height);
		context.strokeRect(this.x, this.y, this.width, this.height);
	}

	// interpolate() {
	// 	if (this.targetX) this.x += (this.targetX - this.x) * 0.5;
	// 	if (this.targetY) this.y += (this.targetY - this.y) * 0.5;
	// }

	interpolate() {
		if (this.targetX >= 0) this.x += this.targetX - this.x * 0.5;
		if (this.targetY >= 0) this.y += this.targetY - this.y * 0.5;
	}
}
