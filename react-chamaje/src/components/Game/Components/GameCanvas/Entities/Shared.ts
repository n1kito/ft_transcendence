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

		// draw the entity
		context.fillRect(this.x, this.y, this.width, this.height);
	}
}
