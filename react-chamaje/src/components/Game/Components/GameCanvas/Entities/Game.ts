import { PaddleDirection } from './Shared';
import Paddle from './Paddle';
import Ball from './Ball';

export class Game {
	// private gameCanvas: React.MutableRefObject<HTMLCanvasElement>;
	private canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
	private gameContext: CanvasRenderingContext2D;
	private animationFrameId: number | undefined;

	private TICK_RATE = 1000 / 60; // we want 60 updates per second (in milliseconds, so we can use the value with Date.now()
	private lastTick = Date.now();

	private paddlePlayer: Paddle;
	private paddleOpponent: Paddle;
	private ball: Ball;

	private playerScore: number = 0;
	private opponentScore: number = 0;

	private canvasSize: { width: number; height: number };
	private paddleHeight: number;

	private gradient: CanvasGradient;

	private broadcastPlayerPosition: (direction: string) => void;

	constructor(
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
		gameContext: CanvasRenderingContext2D,
		broadcastPlayerPosition: (direction: string) => void,
	) {
		// Init the canvas reference
		this.canvasRef = canvasRef;
		// Init the game context
		this.gameContext = gameContext;

		// Init default values
		this.canvasSize = {
			width: canvasRef.current!.width,
			height: canvasRef.current!.height,
		};
		this.paddleHeight = this.canvasSize.height * 0.2;
		const paddleWidth = 5,
			ballSize = 15;

		// Init broadcastPlayerPosition
		this.broadcastPlayerPosition = broadcastPlayerPosition;

		// Create player1 paddle
		this.paddlePlayer = new Paddle(
			0,
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			paddleWidth,
			this.paddleHeight,
		);
		// Create opponent paddle
		this.paddleOpponent = new Paddle(
			this.canvasSize.width - paddleWidth,
			// this.canvasSize.height / 2 - this.paddleHeight / 2,
			0,
			paddleWidth,
			// this.paddleHeight,
			this.canvasSize.height,
		);
		// Create ball
		this.ball = new Ball(
			this.canvasSize.width / 2 - ballSize / 2,
			this.canvasSize.height / 2 - ballSize / 2,
			ballSize,
			ballSize,
		);

		// Init the gradient style
		this.gradient = this.initGradient();

		// Setup event listeners on canvas
		this.setupEventListeners();
	}

	// calls all the functions needed to update the game state
	gameLoop = (): void => {
		let dateNow = Date.now();
		let timeSinceLastTick = dateNow - this.lastTick;

		if (timeSinceLastTick >= this.TICK_RATE) {
			this.update();
			this.lastTick = dateNow - (timeSinceLastTick % this.TICK_RATE);
			// this.log(`Scores: ${this.playerScore}/${this.opponentScore}`);
		}

		this.draw();
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	};

	cancelGameLoop(): void {
		if (this.animationFrameId != undefined)
			window.cancelAnimationFrame(this.animationFrameId);
	}

	setupEventListeners(): void {
		this.log('adding event listeners');
		window.addEventListener('keydown', this.handleKeyPress);
		window.addEventListener('keyup', this.handleKeyRelease);
	}

	removeEventListeners(): void {
		this.log('removing event listeners');
		window.removeEventListener('keydown', this.handleKeyPress);
		window.removeEventListener('keyup', this.handleKeyRelease);
	}

	handleKeyPress = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowUp') {
			console.log('[🕹️] up');
			this.broadcastPlayerPosition('up');
			// change the direction of the paddle
			this.paddlePlayer.setDirection(PaddleDirection.up);
		}
		if (event.key === 'ArrowDown') {
			console.log('[🕹️] down');
			this.broadcastPlayerPosition('down');
			// change the direction of the paddle
			this.paddlePlayer.setDirection(PaddleDirection.down);
		}
	};

	handleKeyRelease = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			// this.broadcastPlayerPosition('immobile');
			this.paddlePlayer.setDirection(PaddleDirection.immobile);
		}
	};

	update(): void {
		this.paddlePlayer.update(this.canvasRef);
		this.paddleOpponent.update(this.canvasRef);
		this.ball.update(
			this.paddlePlayer,
			this.paddleOpponent,
			this.canvasRef,
			this.handleScoreUpdate,
		);
	}

	// draws all of our elements on the canvas
	draw(): void {
		// this.log('draw()');
		// Clear our canvas
		this.gameContext.clearRect(
			0,
			0,
			this.canvasSize.width,
			this.canvasSize.height,
		);
		// Draw our net
		this.drawNet();
		// Draw our scores
		this.drawScores();
		// Draw our paddles
		this.paddlePlayer.draw(this.gameContext);
		this.paddleOpponent.draw(this.gameContext);
		// Draw our ball
		this.ball.draw(this.gameContext);
	}

	// draws the net on our court
	drawNet(): void {
		const netWidth = 3;
		this.gameContext.fillStyle = this.gradient;
		this.gameContext.fillRect(
			this.canvasSize.width / 2 - netWidth / 2,
			0,
			netWidth,
			this.canvasSize.height,
		);
	}

	drawScores(): void {
		const fontSize = this.canvasSize.height / 6;
		this.gameContext.font = `${fontSize}px VT323`;
		this.gameContext.textAlign = 'center';
		this.gameContext.fillText(
			`${this.playerScore}`,
			this.canvasSize.width * 0.25,
			this.canvasSize.height * 0.9,
		);
		this.gameContext.fillText(
			`${this.opponentScore}`,
			this.canvasSize.width * 0.75,
			this.canvasSize.height * 0.9,
		);
	}

	handleScoreUpdate = (won: boolean) => {
		if (won) this.playerScore++;
		else this.opponentScore++;
	};

	initGradient(): CanvasGradient {
		const gradient: CanvasGradient = this.gameContext.createLinearGradient(
			this.canvasSize.width / 2,
			0,
			this.canvasSize.width / 2,
			this.canvasSize.width,
		);
		// Add colors to the gradient
		gradient.addColorStop(0.1086, 'rgba(194, 255, 182, 0.69)');
		gradient.addColorStop(0.5092, 'rgba(254, 164, 182, 1.00)');
		gradient.addColorStop(0.5093, '#FFA3B6');
		gradient.addColorStop(0.7544, '#DDA9FF');
		gradient.addColorStop(1.0, '#A2D1FF');

		return gradient;
	}

	log(message: string): void {
		console.log(`%c Game %c ${message}`, 'background:green;color:yellow', '');
	}

	// Updates the locally stored variables for the canvas size
	updateCanvasSize() {
		if (!this.canvasRef || !this.canvasRef.current) return;
		this.canvasSize.height = this.canvasRef.current?.height;
		this.canvasSize.width = this.canvasRef.current?.width;
	}
}
