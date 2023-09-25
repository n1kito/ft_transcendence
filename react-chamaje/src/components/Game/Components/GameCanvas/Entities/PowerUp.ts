import { GameEntity } from './Shared';
import Paddle from './Paddle';
import { IBallState } from '../../../../../../../shared-lib/types/game';

export default class PowerUp {
	private width: number;
	private height: number;
	private canvasSize: { width: number; height: number };
	private context: CanvasRenderingContext2D;
	private gradient: CanvasGradient;
	private blinkVisible = true;
	private text = 'hit me';

	constructor(
		context: CanvasRenderingContext2D,
		canvasSize: { width: number; height: number },
	) {
		this.canvasSize = canvasSize;
		this.width = this.height = canvasSize.height / 6;
		this.context = context;

		this.gradient = this.context.createLinearGradient(
			this.width / 2,
			0,
			this.width / 2,
			this.width,
		);
		// Add colors to the gradient
		this.gradient.addColorStop(0.1086, 'rgb(194, 255, 182)');
		this.gradient.addColorStop(0.5092, 'rgb(254, 164, 182)');
		this.gradient.addColorStop(0.5093, '#FFA3B6');
		this.gradient.addColorStop(0.7544, '#DDA9FF');
		this.gradient.addColorStop(1.0, '#A2D1FF');

		setInterval(() => {
			this.blinkVisible = !this.blinkVisible;
		}, 500);
		// setInterval(() => {
		// 	if (this.text == 'power up') this.text = 'click and';
		// 	else this.text = 'power up';
		// }, 1000);
	}

	// Draw the powerup
	draw(): void {
		if (!this.context) console.error('NO CONTEXT IN POWERUP');
		else {
			const fontSize = this.height;
			this.context.font = `${fontSize}px VT323`;
			this.context.textAlign = 'center';
			this.context.textBaseline = 'middle';
			this.context.fillText(
				`🐝`,
				this.canvasSize.width / 2,
				this.canvasSize.height / 2,
			);
			if (this.blinkVisible) {
				this.context.font = `${fontSize / 4}px VT323`;
				this.context.fillText(
					`${this.text}`,
					this.canvasSize.width / 2,
					this.canvasSize.height / 2 + this.height * 0.5,
				);
			}
		}
		// // setup the visual style
		// context.fillStyle = 'white';
		// context.shadowOffsetX = 0;
		// context.shadowOffsetY = 0;
		// // draw the entites

		// context.shadowColor = 'pink';
		// context.shadowBlur = 40;
		// context.fillRect(this.x, this.y, this.width, this.height);
		// context.shadowColor = 'pink';
		// context.shadowBlur = 30;
		// context.fillRect(this.x, this.y, this.width, this.height);
		// context.shadowColor = 'pink';
		// context.shadowBlur = 20;
		// context.fillRect(this.x, this.y, this.width, this.height);
		// context.strokeRect(this.x, this.y, this.width, this.height);
	}
}
