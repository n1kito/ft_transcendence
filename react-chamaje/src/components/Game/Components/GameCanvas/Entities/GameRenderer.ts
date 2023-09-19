import { Socket } from 'socket.io-client';
import { GameLogic } from './GameLogic';

export class GameRenderer {
	private gameLogic: GameLogic;

	private socket: Socket | null;

	// private canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
	private gameContext: CanvasRenderingContext2D;

	private gradient: CanvasGradient;

	private animationFrameId: number | undefined;

	private keysPressed = {};

	constructor(
		socket: React.MutableRefObject<Socket | null>,
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
		gameContext: CanvasRenderingContext2D,
		broadcastPlayerPosition: (
			direction: string,
			inputSequenceNumber: number,
		) => void,
	) {
		this.socket = socket.current;
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

	// calls all the functions needed to update the game state
	gameLoop = (): void => {
		this.gameLogic.updateGameState();
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
			console.log('[🕹️] up');
			direction = 'up';
			// this.broadcastPlayerPosition('up');
			// change the direction of the paddle
			// this.paddlePlayer.setDirection(PaddleDirection.up);
		}
		if (event.key === 'ArrowDown') {
			console.log('[🕹️] down');
			direction = 'down';
			// this.broadcastPlayerPosition('down');
			// change the direction of the paddle
			// this.paddlePlayer.setDirection(PaddleDirection.down);
		}
		// If a direction was registered
		if (direction) {
			this.gameLogic.inputSequenceNumber++; //increase the sequence number of the input
			this.gameLogic.broadcastPlayerPosition(
				direction,
				this.gameLogic.inputSequenceNumber,
			); // send it to the server
			this.gameLogic.paddlePlayer.setDirection(direction); // update the player's direction
			// add the action to the array of actions that have not yet been confirmed by the server
			this.gameLogic.unconfirmedInputs.push({
				sequenceNumber: this.gameLogic.inputSequenceNumber,
				direction: direction,
			});
		}
	};

	handleKeyRelease = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			// this.broadcastPlayerPosition('immobile');
			this.gameLogic.inputSequenceNumber++;
			this.gameLogic.broadcastPlayerPosition(
				'immobile',
				this.gameLogic.inputSequenceNumber,
			);
			this.gameLogic.paddlePlayer.setDirection('immobile');
			this.gameLogic.unconfirmedInputs.push({
				sequenceNumber: this.gameLogic.inputSequenceNumber,
				direction: 'immobile',
			});
		}
	};

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
		// Draw our paddles
		this.gameLogic.paddlePlayer.draw(this.gameContext);
		this.gameLogic.paddleOpponent.draw(this.gameContext);
		// Draw our ball
		this.gameLogic.ball.draw(this.gameContext);
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
		gradient.addColorStop(0.1086, 'rgba(194, 255, 182, 0.69)');
		gradient.addColorStop(0.5092, 'rgba(254, 164, 182, 1.00)');
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
