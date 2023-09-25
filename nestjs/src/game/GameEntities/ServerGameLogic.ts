import Ball from './Ball';
import Paddle from './Paddle';
import { Server } from 'socket.io';
import { IBallState, IGameState, IPlayerState } from 'shared-lib/types/game';
import { EventEmitter } from 'stream';

export class GameLogic {
	private server: Server;

	// Initiate an event emitter so this instance can communicate with the gameService
	eventEmitter: EventEmitter = new EventEmitter();

	// Broadcasting functions
	private player1IsReady: boolean = false;
	private player2IsReady: boolean = false;
	private gameHasStarted: boolean = false;
	private gameBroadcastInterval: NodeJS.Timeout | undefined = undefined;
	private gameStateUpdateInterval: NodeJS.Timeout | undefined = undefined;

	players: { [socketId: string]: Paddle } = {};
	public ball: Ball;

	// Game session state
	public player1UserId: number;
	public player2UserId: number;
	public player1Score: number = 0;
	public player2Score: number = 0;
	public powerupsEnabled: boolean = true;

	public canvasSize = { width: 700, height: 500 };
	public paddleWidth = 5;
	public paddleHeight = this.canvasSize.height * 0.2;
	public ballSize = 10;

	// private gameStateInterval = 16.6666666667; // 60 FPS
	// private gameStateInterval = 10; // 60 FPS

	constructor(
		player1SocketId: string,
		player1UserId: number,
		player2SocketId: string,
		player2UserId: number,
		server: Server,
	) {
		// Initiate the server and room Id, so we can broadcast from here directly
		this.server = server;

		// Add player1 with their corresponding paddle mapped to their socketId
		this.players[player1SocketId] = new Paddle(
			0,
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			this.paddleWidth,
			this.paddleHeight,
		);
		this.player1UserId = player1UserId;
		// Add player2 with their corresponding paddle mapped to their socketId
		this.players[player2SocketId] = new Paddle(
			this.canvasSize.width - this.paddleWidth,
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			this.paddleWidth,
			this.paddleHeight,
		);
		this.player2UserId = player2UserId;
		// Create ball
		this.ball = new Ball(
			this.canvasSize.width / 2 - this.ballSize / 2,
			this.canvasSize.height / 2 - this.ballSize / 2,
			this.ballSize,
			this.ballSize,
		);
		if (Object.keys(this.players).length === 2) {
			this.log('Game logic instantiated with two players');
		}
	}

	updatePlayerPosition(
		playerSocketId: string,
		direction: 'up' | 'down' | 'immobile',
	) {
		// Change the paddle's direction
		this.setPlayerDirection(playerSocketId, direction);
		// Update that paddle's position
		this.players[playerSocketId].update(this.canvasSize);
	}

	updateGameState(/*timeBetweenTwoFrames: number*/): void {
		// // Update the position of each player
		// for (const playerSocketId in this.players)
		// 	this.players[playerSocketId].update(
		// 		this.canvasSize,
		// 		timeBetweenTwoFrames,
		// 	);
		// And the position of the ball
		const [player1SocketId, player2SocketId] = Object.keys(this.players);
		this.ball.update(
			this.players[player1SocketId],
			this.players[player2SocketId],
			this.canvasSize,
			this.handleScoreUpdate,
			// timeBetweenTwoFrames,
		);
	}

	handleScoreUpdate = (won: boolean) => {
		if (won) this.player1Score++;
		else this.player2Score++;
	};

	log(message: string) {
		console.log(`[🎲 GAME LOGIC] ${message}`);
	}

	// Allows to update a player's current direction
	setPlayerDirection(
		playerSocketId: string,
		direction: 'up' | 'down' | 'immobile',
	) {
		this.players[playerSocketId].setDirection(direction);
	}

	broadcastGameState() {
		const [player1SocketId, player2SocketId] = Object.keys(this.players);

		const currentBallState: IBallState = {
			x: this.ball.x,
			y: this.ball.y,
			width: this.ball.width,
			height: this.ball.height,
		};
		const currentPlayer1State: IPlayerState = {
			x: 0,
			y: this.players[player1SocketId].y,
			width: this.players[player1SocketId].width,
			height: this.players[player1SocketId].height,
			score: this.player1Score,
		};
		const currentPlayer2State: IPlayerState = {
			x: this.canvasSize.width - this.paddleWidth,
			y: this.players[player2SocketId].y,
			width: this.players[player2SocketId].width,
			height: this.players[player2SocketId].height,
			score: this.player2Score,
		};
		const player1StateUpdate: IGameState = {
			player1: currentPlayer1State,
			player2: currentPlayer2State,
			ball: currentBallState,
		};
		// Creating the state update for player2 (right side of the screen for us, so things need to be flipped for them,
		// since both players appear on the left side of their screen)
		const player2StateUpdate: IGameState = {
			// This is their left-hand side player, so player2 for us
			player1: {
				...currentPlayer2State,
				x: 0,
			},
			// This is their opponent, so player1 for us
			player2: {
				...currentPlayer1State,
				x: this.canvasSize.width - this.paddleWidth,
			},
			// The x coordinates and xVelocity values of the ball need to be flipped
			ball: {
				...currentBallState,
				x: this.canvasSize.width - currentBallState.x - this.ballSize,
				// xVelocity: -currentBallState.xVelocity,
			},
		};
		// Send the stated to each player
		this.server
			.to(player1SocketId)
			.emit('game-state-update', player1StateUpdate);
		this.server
			.to(player2SocketId)
			.emit('game-state-update', player2StateUpdate);
	}

	startGame() {
		this.gameHasStarted = true;
		this.broadcastGameState();
		this.startGameSimulation();
	}

	endGame() {
		this.gameHasStarted = false;
		this.stopBroadcasting();
		this.stopGameSimulation();
		this.eventEmitter.emit('game-ended');
	}

	setPlayerAsReady(playerSocketId: string) {
		const playerIndex =
			Object.keys(this.players).indexOf(playerSocketId) === 0 ? 1 : 2;
		if (playerIndex === 1) {
			this.log('Player 1 is ready to play');
			this.player1IsReady = true;
		} else if (playerIndex === 2) {
			this.log('Player 2 is ready to play');
			this.player2IsReady = true;
		} else return; // TODO: do something better here
	}

	bothPlayersAreReady() {
		return this.player1IsReady && this.player2IsReady;
	}

	// Start the game simulation with an interval of 50ms
	private startGameSimulation() {
		const gameStateInterval = 10;

		this.log(`Started game simulation at ${gameStateInterval}ms interval`);
		if (this.gameHasStarted && !this.gameStateUpdateInterval) {
			this.gameStateUpdateInterval = setInterval(() => {
				this.updateGameState();
				// Check to see if anyone won
				if (this.player1Score === 11 || this.player2Score === 11) {
					this.endGame();
				}
			}, gameStateInterval);
		}
	}

	private stopBroadcasting() {
		if (this.gameBroadcastInterval) {
			clearInterval(this.gameBroadcastInterval);
			this.gameBroadcastInterval = undefined;
		}
	}

	private stopGameSimulation() {
		if (this.gameStateUpdateInterval) {
			clearInterval(this.gameStateUpdateInterval);
			this.gameStateUpdateInterval = undefined;
		}
	}
}
