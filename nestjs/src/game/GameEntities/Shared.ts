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
}
