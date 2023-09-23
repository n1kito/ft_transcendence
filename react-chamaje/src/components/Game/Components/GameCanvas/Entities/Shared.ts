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
	targetX = 0;
	targetY = 0;

	constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	draw(context: CanvasRenderingContext2D): void {
		// setup the visual style
		context.fillStyle = 'white';
		context.shadowColor = 'pink';
		context.shadowBlur = 20;
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;

		// TODO: this interpolates even when the ball is going to the center
		// whih looks awful, but not sure how to track whether the ball
		// needs to go back after score changes
		this.interpolate();

		// draw the entity
		context.fillRect(this.x, this.y, this.width, this.height);
	}

	interpolate() {
		if (this.targetX) this.x += (this.targetX - this.x) * 0.5;
		if (this.targetY) this.y += (this.targetY - this.y) * 0.5;
	}
}
