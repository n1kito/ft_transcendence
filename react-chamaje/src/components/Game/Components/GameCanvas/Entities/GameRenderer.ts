import { Socket } from 'socket.io-client';
import { GameLogic } from './ClientGameLogic';
import { IPlayerMovementPayload } from '../../../../../../../shared-lib/types/game';

export class GameRenderer {
	gameLogic: GameLogic;

	private socket: Socket | null;

	// private canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
	private gameContext: CanvasRenderingContext2D;

	private gradient: CanvasGradient;

	private animationFrameId: number | undefined;

	private playerPositionBroadcastInterval: NodeJS.Timer | undefined;

	private previousFrameTimeStamp = 0;
	private timeBetweenTwoFrames = 0;

	// Assume 60 logic updates per second, i.e., around 16.667ms per update
	private fixedTimeStep = 1 / 60;
	private accumulatedTime = 0;

	constructor(
		socket: React.MutableRefObject<Socket | null>,
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
		gameContext: CanvasRenderingContext2D,
		broadcastPlayerPosition: (payload: IPlayerMovementPayload) => void,
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

	startGame = (): void => {
		this.startBroadcastingToServer();
		this.animationFrameId = requestAnimationFrame(this.gameLoop);
	};

	stopGame = (): void => {
		this.stopBroadcastingToServer();
		this.cancelGameLoop();
	};

	// gameLoop = (currentFrameTimeStamp) => {
	// 	let delta = (currentFrameTimeStamp - this.previousFrameTimeStamp) / 1000;
	// 	this.previousFrameTimeStamp = currentFrameTimeStamp;

	// 	// Accumulate time passed
	// 	accumulatedTime += delta;

	// 	// Update game state in fixed time steps
	// 	while (accumulatedTime >= fixedTimeStep) {
	// 		this.gameLogic.updateElementsState(fixedTimeStep);
	// 		accumulatedTime -= fixedTimeStep;
	// 	}

	// 	// Now draw your game
	// 	this.draw();

	// 	this.animationFrameId = requestAnimationFrame(this.gameLoop);
	// };
	lastFrame = performance.now();
	// calls all the functions needed to update the game state
	gameLoop = (currentFrameTimeStamp: number): void => {
		const delta = (currentFrameTimeStamp - this.previousFrameTimeStamp) / 1000;
		// calculate how much time has passed
		// this.timeBetweenTwoFrames =
		// (currentFrameTimeStamp - this.previousFrameTimeStamp) / 1000;
		this.previousFrameTimeStamp = currentFrameTimeStamp;

		// Accumulate time passed
		this.accumulatedTime += delta;

		// Update game state in fixed time steps
		while (this.accumulatedTime >= this.fixedTimeStep) {
			this.gameLogic.updateElementsState(this.fixedTimeStep);
			this.accumulatedTime -= this.fixedTimeStep;
		}

		let pouet = currentFrameTimeStamp - this.lastFrame;
		console.log(`Client update time: ${pouet}ms`);
		this.lastFrame = currentFrameTimeStamp;

		// // Log the current FPS
		// const fps = Math.round(1 / this.timeBetweenTwoFrames);
		// this.log(`${fps} FPS`);

		// Limit the time between two frames to a maximum of 0.1, in case
		// it goes too high (after switching tabs or on load for example)
		// this.timeBetweenTwoFrames = Math.min(this.timeBetweenTwoFrames, 0.1);

		// Update the game state locally (Client side prediction)
		// this.gameLogic.updateElementsState(this.timeBetweenTwoFrames);
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
			// Update the paddle's position
			this.gameLogic.paddlePlayer.setDirection(direction);

			// give an id to that state and send it to the server
			// this.gameLogic.inputSequenceId++; //increase the sequence number of the input
			// this.gameLogic.broadcastPlayerPosition(
			// 	direction,
			// 	this.gameLogic.inputSequenceId,
			// );
			// // add the action to the array of actions that have not yet been confirmed by the server
			// this.gameLogic.unconfirmedInputs.push({
			// 	sequenceNumber: this.gameLogic.inputSequenceNumber,
			// 	direction: direction,
			// });
		}
	};

	handleKeyRelease = (event: KeyboardEvent): void => {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			// // this.broadcastPlayerPosition('immobile');
			this.gameLogic.paddlePlayer.setDirection('immobile');
			// this.gameLogic.inputSequenceId++;
			// this.gameLogic.broadcastPlayerPosition(
			// 	'immobile',
			// 	this.gameLogic.inputSequenceId,
			// );
			// this.gameLogic.unconfirmedInputs.push({
			// 	sequenceNumber: this.gameLogic.inputSequenceNumber,
			// 	direction: 'immobile',
			// });

			// Send the new direction to the backend
			// this.socket?.emit('player-moved', { direction: 'immobile' });
		}
	};

	startBroadcastingToServer() {
		if (!this.playerPositionBroadcastInterval) {
			// TODO: the question here is: do I need to broadcast the initial state of the server
			// or does it make o difference? I don't think so
			const startingState: IPlayerMovementPayload = {
				inputSequenceId: this.gameLogic.inputSequenceId,
				direction: this.gameLogic.paddlePlayer.getDirection(),
				ballXVelocity: this.gameLogic.ball.xVelocity,
				ballYVelocity: this.gameLogic.ball.yVelocity,
				ballSpeed: this.gameLogic.ball.speed,
			};
			this.gameLogic.broadcastPlayerPosition(startingState);
			this.playerPositionBroadcastInterval = setInterval(() => {
				this.gameLogic.log('sharing player direction with server');
				this.gameLogic.inputSequenceId++;
				const currentState: IPlayerMovementPayload = {
					inputSequenceId: this.gameLogic.inputSequenceId,
					direction: this.gameLogic.paddlePlayer.getDirection(),
					ballXVelocity: this.gameLogic.ball.xVelocity,
					ballYVelocity: this.gameLogic.ball.yVelocity,
					ballSpeed: this.gameLogic.ball.speed,
				};
				this.gameLogic.untreatedInputs.push(currentState);
				console.log(this.gameLogic.untreatedInputs.length);
				// console.log(this.gameLogic.untreatedInputs);
				this.gameLogic.broadcastPlayerPosition(currentState);
			}, 15);
		}
	}

	// TODO: make sure this is being used somewhere
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
