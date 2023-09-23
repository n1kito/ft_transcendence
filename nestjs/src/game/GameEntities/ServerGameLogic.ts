import { findIndex } from 'rxjs';
import Ball from './Ball';
import Paddle from './Paddle';
import { Server } from 'socket.io';
import { IGameState } from 'shared-lib/types/game';

export class GameLogic {
	// public paddlePlayer: Paddle;
	// public paddleOpponent: Paddle;
	private server: Server;
	// private roomId: string;

	// Broadcasting functions
	private player1IsReady: boolean = false;
	private player2IsReady: boolean = false;
	private gameHasStarted: boolean = false;
	private gameBroadcastInterval: NodeJS.Timeout | undefined = undefined;
	private gameStateUpdateInterval: NodeJS.Timeout | undefined = undefined;

	private players: { [socketId: string]: Paddle } = {};
	public ball: Ball;

	public player1Score: number = 0;
	public player2Score: number = 0;

	public canvasSize = { width: 700, height: 500 };
	public paddleWidth = 5;
	public paddleHeight = this.canvasSize.height * 0.2;
	public ballSize = 10;

	private gameStateInterval = 16.6666666667; // 60 FPS

	constructor(
		player1SocketId: string,
		player2SocketId: string,
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
		// Add player2 with their corresponding paddle mapped to their socketId
		this.players[player2SocketId] = new Paddle(
			this.canvasSize.width - this.paddleWidth,
			this.canvasSize.height / 2 - this.paddleHeight / 2,
			this.paddleWidth,
			this.paddleHeight,
		);
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

	updateGameState(timeBetweenTwoFrames: number): void {
		// Update the position of each player
		for (const playerSocketId in this.players)
			this.players[playerSocketId].update(
				this.canvasSize,
				timeBetweenTwoFrames,
			);
		// And the position of the ball
		const [player1SocketId, player2SocketId] = Object.keys(this.players);
		this.ball.update(
			this.players[player1SocketId],
			this.players[player2SocketId],
			this.canvasSize,
			this.handleScoreUpdate,
			timeBetweenTwoFrames,
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
		inputSequenceId: number,
	) {
		// console.log({ inputSequenceId });
		// For convenience, find if we're updating the position of player 1 or 2
		const playerIndex =
			Object.keys(this.players).indexOf(playerSocketId) === 0 ? 1 : 2;

		// this.log(
		// 	`Updating direction to Player${playerIndex} [${playerSocketId}] to ${direction}`,
		// );
		this.players[playerSocketId].setDirection(direction);
		this.players[playerSocketId].latestInputSequenceId = inputSequenceId;
	}

	broadcastGameState() {
		// this.log('Broadcasting game state...');
		const [player1SocketId, player2SocketId] = Object.keys(this.players);
		// Creating the state udpdate for player1 (left side of the screen)
		const player1StateUpdate: IGameState = {
			// Each player gets their latest input sequence id
			inputSequenceId: this.players[player1SocketId].latestInputSequenceId,
			player1: {
				x: 0,
				y: this.players[player1SocketId].y,
				width: this.players[player1SocketId].width,
				height: this.players[player1SocketId].height,
				score: this.player1Score,
			},
			player2: {
				x: this.canvasSize.width - this.paddleWidth,
				y: this.players[player2SocketId].y,
				width: this.players[player2SocketId].width,
				height: this.players[player2SocketId].height,
				score: this.player2Score,
			},
			ball: {
				x: this.ball.x,
				y: this.ball.y,
				xVelocity: this.ball.xVelocity,
				yVelocity: this.ball.yVelocity,
				speed: this.ball.speed,
				width: this.ball.width,
				height: this.ball.height,
			},
		};
		// Creating the state update for player2 (right side of the screen for us, so things need to be flipped for them,
		// since both players appear on the left side of their screen)
		const player2StateUpdate: IGameState = {
			// Each player gets their latest input sequence id
			inputSequenceId: this.players[player2SocketId].latestInputSequenceId,
			// This is their left-hand side player, so player2 for us
			player1: {
				x: 0,
				y: this.players[player2SocketId].y,
				width: this.players[player2SocketId].width,
				height: this.players[player2SocketId].height,
				score: this.player2Score,
			},
			// This is their opponent, so player1 for us
			player2: {
				x: this.canvasSize.width - this.paddleWidth,
				y: this.players[player1SocketId].y,
				width: this.players[player1SocketId].width,
				height: this.players[player1SocketId].height,
				score: this.player1Score,
			},
			// The x coordinates of the ball need to be flipped
			ball: {
				x: this.canvasSize.width - this.ball.x,
				y: this.ball.y,
				xVelocity: -this.ball.xVelocity,
				yVelocity: this.ball.yVelocity,
				speed: this.ball.speed,
				width: this.ball.width,
				height: this.ball.height,
			},
		};
		console.log(JSON.stringify(player1StateUpdate, null, 4));
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
		this.startGameSimulation();
		this.startBroadcasting();
	}

	endGame() {
		this.gameHasStarted = false;
		this.stopBroadcasting();
		this.stopGameSimulation();
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

	// Start broadcasting to clients with an interval of 500ms
	private startBroadcasting() {
		const gameBroadcastInterval = 15;

		this.log(`Started broadcasting at ${gameBroadcastInterval}ms interval`);
		if (this.gameHasStarted && !this.gameBroadcastInterval) {
			this.gameBroadcastInterval = setInterval(() => {
				// console.log(
				// 	`[Server] Timestamp: ${Date.now()}, BallX: ${this.ball.x}, BallY: ${
				// 		this.ball.y
				// 	}`,
				// );
				this.broadcastGameState();
			}, gameBroadcastInterval);
		}
	}

	// Start the game simulation with an interval of 50ms
	private startGameSimulation() {
		// const gameStateInterval = 10;

		this.log(`Started game simulation at ${this.gameStateInterval}ms interval`);
		// let serverUpdateTime = Date.now();
		if (this.gameHasStarted && !this.gameStateUpdateInterval) {
			// let currentTime = Date.now();
			this.gameStateUpdateInterval = setInterval(() => {
				// let currentTime = Date.now();
				// console.log(`Server update time: ${currentTime - serverUpdateTime}ms`);
				// serverUpdateTime = currentTime;
				this.updateGameState(this.gameStateInterval / 1000);
			}, this.gameStateInterval);
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

	// TODO: create startBroadcasting && stopBroadcasting function ?
}
