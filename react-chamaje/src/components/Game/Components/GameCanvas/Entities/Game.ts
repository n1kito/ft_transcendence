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

class Paddle extends GameEntity {
	private speed: number = 10;

	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
	}
	update(canvasSize: ICanvasSizeProps) {}
}

class Ball extends GameEntity {
	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
	}
	update(
		playerPadde: Paddle,
		opponentPaddle: Paddle,
		canvasSize: ICanvasSizeProps,
	) {}
}

interface ICanvasSizeProps {
	width: number;
	height: number;
}

export class Game {
	// private gameCanvas: React.MutableRefObject<HTMLCanvasElement>;
	private canvasRef:
		| React.MutableRefObject<HTMLCanvasElement | null>
		| undefined;
	private gameContext: CanvasRenderingContext2D;
	private animationFrameId: number | undefined;

	private paddlePlayer: Paddle;
	private paddleOpponent: Paddle;
	private ball: Ball;

	private canvasSize: ICanvasSizeProps;
	private paddleHeight: number;

	private gradient: CanvasGradient;

	private updatePlayerPosition: (direction: string) => void;

	constructor(
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
		gameContext: CanvasRenderingContext2D,
		updatePlayerPosition: (direction: string) => void,
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

		// Init updatePlayerPosition
		this.updatePlayerPosition = updatePlayerPosition;

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
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			paddleWidth,
			this.paddleHeight,
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

		// Bind the loop method to the current instance of our game class
		// this.gameLoop = this.gameLoop.bind(this);
	}

	// calls all the functions needed to update the game state
	gameLoop = (): void => {
		this.update(); // TODO: this should be here
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
	}

	removeEventListeners(): void {
		this.log('removing event listeners');
		window.removeEventListener('keydown', this.handleKeyPress);
	}

	handleKeyPress = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowUp') {
			console.log('[🕹️] up');
			this.updatePlayerPosition('up');
		}
		if (event.key === 'ArrowDown') {
			console.log('[🕹️] down');
			this.updatePlayerPosition('down');
		}
	};

	update(): void {
		this.paddlePlayer.update(this.canvasSize);
		this.paddleOpponent.update(this.canvasSize);
		this.ball.update(this.paddlePlayer, this.paddleOpponent, this.canvasSize);
	}

	// draws all of our elements on the canvas
	draw(): void {
		this.log('draw()');
		// Clear our canvas
		this.gameContext.clearRect(
			0,
			0,
			this.canvasSize.width,
			this.canvasSize.height,
		);
		// Draw our net
		this.drawNet();
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
}
