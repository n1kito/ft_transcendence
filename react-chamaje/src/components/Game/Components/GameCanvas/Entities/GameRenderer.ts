import { GameLogic } from './GameLogic';
import { IPlayerMovementPayload } from '../../../../../../../shared-lib/types/game';

export class GameRenderer {
	gameLogic: GameLogic;
	private gameContext: CanvasRenderingContext2D;
	private gradient: CanvasGradient;
	private animationFrameId: number | undefined;
	private playerPositionBroadcastInterval: NodeJS.Timer | undefined;

	constructor(
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
		gameContext: CanvasRenderingContext2D,
		broadcastPlayerPosition: (payload: IPlayerMovementPayload) => void,
	) {
		// Storing the game logic instance
		this.gameLogic = new GameLogic(
			{ width: canvasRef.current!.width, height: canvasRef.current!.height },
			broadcastPlayerPosition,
		);

		// this.canvasRef = canvasRef;
		this.gameContext = gameContext;

		// Init the gradient style
		this.gradient = this.initGradient();

		// Setup event listeners on canvas
		this.setupEventListeners();
	}

	/*
	░█▀▀░█▀█░█▄█░█▀▀░░░█░░░█▀█░█▀█░█▀█
	░█░█░█▀█░█░█░█▀▀░░░█░░░█░█░█░█░█▀▀
	░▀▀▀░▀░▀░▀░▀░▀▀▀░░░▀▀▀░▀▀▀░▀▀▀░▀░░
	*/

	startGame = (): void => {
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
		this.startBroadcastingToServer();
	};

	stopGame = (): void => {
		this.stopBroadcastingToServer();
		this.cancelGameLoop();
	};

	// The game loop's only job is to continuously render the canvas
	// and predict the ball's movements (which will be regularly corrected by the server)
	lastTime = 0;
	gameLoop = (timestamp: number): void => {
		this.gameLogic.deltaTime = (timestamp - this.lastTime) / 1000; // Time since last frame in seconds
		this.lastTime = timestamp;
		this.gameLogic.deltaTime = Math.min(this.gameLogic.deltaTime, 0.1);
		// console.log('delta time = ', this.gameLogic.deltaTime);

		// console.log(this.gameLogic.ball.x, this.gameLogic.ball.y);
		this.gameLogic.updateBallPosition();
		this.gameLogic.paddlePlayer.update(
			{ width: 700, height: 500 },
			this.gameLogic.deltaTime,
		);
		this.draw();
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	};

	cancelGameLoop(): void {
		if (this.animationFrameId != undefined)
			window.cancelAnimationFrame(this.animationFrameId);
	}

	/*
	░█░░░▀█▀░█▀▀░▀█▀░█▀▀░█▀█░█▀▀░█▀▄░█▀▀
	░█░░░░█░░▀▀█░░█░░█▀▀░█░█░█▀▀░█▀▄░▀▀█
	░▀▀▀░▀▀▀░▀▀▀░░▀░░▀▀▀░▀░▀░▀▀▀░▀░▀░▀▀▀
	*/

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
		let direction = null;
		if (event.key === 'ArrowUp') {
			// console.log('[🕹️] up');
			direction = 'up';
		}
		if (event.key === 'ArrowDown') {
			// console.log('[🕹️] down');
			direction = 'down';
		}
		// If a direction was registered, update the paddle's position
		// so it's instantanuous on the screen
		if (direction) {
			this.gameLogic.paddlePlayer.setDirection(direction);
		}
	};

	handleKeyRelease = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			this.gameLogic.paddlePlayer.setDirection('immobile');
		}
	};

	startBroadcastingToServer() {
		if (!this.playerPositionBroadcastInterval) {
			this.playerPositionBroadcastInterval = setInterval(() => {
				this.gameLogic.inputSequenceId++;
				const currentState: IPlayerMovementPayload = {
					inputSequenceId: this.gameLogic.inputSequenceId,
					direction: this.gameLogic.paddlePlayer.getDirection(),
					ballXVelocity: this.gameLogic.ball.xVelocity,
					ballYVelocity: this.gameLogic.ball.yVelocity,
					ballSpeed: this.gameLogic.ball.speed,
				};
				this.gameLogic.untreatedInputs.push(currentState);
				this.gameLogic.broadcastPlayerPosition(currentState);
			}, 15);
		}
	}

	stopBroadcastingToServer() {
		if (this.playerPositionBroadcastInterval) {
			clearInterval(this.playerPositionBroadcastInterval);
			this.playerPositionBroadcastInterval = undefined;
		}
	}

	/*
	░█▀▄░█▀▄░█▀█░█░█░▀█▀░█▀█░█▀▀
	░█░█░█▀▄░█▀█░█▄█░░█░░█░█░█░█
	░▀▀░░▀░▀░▀░▀░▀░▀░▀▀▀░▀░▀░▀▀▀
	*/

	// draws all of our elements on the canvas
	draw(): void {
		this.clearCanvas();
		// Draw our net
		this.drawNet();
		// Draw our scores
		this.drawScores();
		// Draw our ball
		this.gameLogic.ball.draw(this.gameContext);
		// Draw our paddles
		this.gameLogic.paddlePlayer.draw(this.gameContext);
		this.gameLogic.paddleOpponent.draw(this.gameContext);
	}

	// clears our canvas
	clearCanvas(): void {
		this.gameContext.clearRect(
			0,
			0,
			this.gameLogic.canvasSize.width,
			this.gameLogic.canvasSize.height,
		);
	}

	// draws the net on our court
	drawNet(): void {
		const netWidth = 3;
		this.gameContext.fillStyle = this.gradient;
		this.gameContext.fillRect(
			this.gameLogic.canvasSize.width / 2 - netWidth / 2,
			0,
			netWidth,
			this.gameLogic.canvasSize.height,
		);
	}

	drawScores(): void {
		const fontSize = this.gameLogic.canvasSize.height / 6;
		this.gameContext.font = `${fontSize}px VT323`;
		this.gameContext.textAlign = 'center';
		this.gameContext.fillText(
			`${this.gameLogic.playerScore}`,
			this.gameLogic.canvasSize.width * 0.25,
			this.gameLogic.canvasSize.height * 0.9,
		);
		this.gameContext.fillText(
			`${this.gameLogic.opponentScore}`,
			this.gameLogic.canvasSize.width * 0.75,
			this.gameLogic.canvasSize.height * 0.9,
		);
	}

	initGradient(): CanvasGradient {
		const gradient: CanvasGradient = this.gameContext.createLinearGradient(
			this.gameLogic.canvasSize.width / 2,
			0,
			this.gameLogic.canvasSize.width / 2,
			this.gameLogic.canvasSize.width,
		);
		// Add colors to the gradient
		gradient.addColorStop(0.1086, 'rgb(194, 255, 182)');
		gradient.addColorStop(0.5092, 'rgb(254, 164, 182)');
		gradient.addColorStop(0.5093, '#FFA3B6');
		gradient.addColorStop(0.7544, '#DDA9FF');
		gradient.addColorStop(1.0, '#A2D1FF');

		return gradient;
	}

	/*
	░█░█░▀█▀░▀█▀░█░░░█▀▀
	░█░█░░█░░░█░░█░░░▀▀█
	░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀
	*/
	log(message: string): void {
		console.log(`%c Game %c ${message}`, 'background:green;color:yellow', '');
	}
}
