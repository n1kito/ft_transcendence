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
	public awaitingPowerUpReply: boolean = false;

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
		// Add player2 with their corresponding paddle mapped to their socketId			const opponentSocketId = Object.keys(this.players).filter((currentSocketId) => currentSocketId != playerSocketId);

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

		// Setup the powerup intervals and activation key sequence
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

	updateGameState(): void {
		const [player1SocketId, player2SocketId] = Object.keys(this.players);
		this.ball.update(
			this.players[player1SocketId],
			this.players[player2SocketId],
			this.canvasSize,
			this.handleScoreUpdate,
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
			},
		};
		// Send the state to each player
		this.server
			.to(player1SocketId)
			.emit('game-state-update', player1StateUpdate);
		this.server
			.to(player2SocketId)
			.emit('game-state-update', player2StateUpdate);
	}

	startGame() {
		this.gameHasStarted = true;
		// this.broadcastGameState();
		this.startBroadcasting();
		this.startGameSimulation();
		// TODO:
		if (this.powerupsEnabled) this.initiateRandomPowerUps();
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

	/*
	░█▀█░█▀█░█░█░█▀▀░█▀▄░░░█░█░█▀█░█▀▀
	░█▀▀░█░█░█▄█░█▀▀░█▀▄░░░█░█░█▀▀░▀▀█
	░▀░░░▀▀▀░▀░▀░▀▀▀░▀░▀░░░▀▀▀░▀░░░▀▀▀
	*/

	// This will randomly trigger power ups, if one is not already waiting to be
	// activated
	initiateRandomPowerUps() {
		const MIN_INTERVAL = 15;
		const MAX_INTERVAL = 30;

		// Get a random interval between 15 and 60 seconds
		const randomInterval =
			Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) +
			MIN_INTERVAL;

		// Initially wait for 'randomInterval * 1000' milliseconds
		setTimeout(() => {
			this.sendPowerUpTrigger();

			// Then continue executing at an interval of 'randomInterval * 1000' milliseconds
			setInterval(() => {
				this.sendPowerUpTrigger();
			}, randomInterval * 1000);
		}, randomInterval * 1000);
	}

	// Generates a trigger string and sends it to both players
	sendPowerUpTrigger() {
		// If there's a powerup ongoing,
		if (this.awaitingPowerUpReply) return;
		const randomPowerUpActivationString =
			this.generatePowerUpActivationString();
		// Log that we are waiting for users to reply
		this.awaitingPowerUpReply = true;
		// Send the powerup triggers
		this.server
			.to(Object.keys(this.players)[0])
			.emit('new-power-up', randomPowerUpActivationString);
		this.server
			.to(Object.keys(this.players)[1])
			.emit('new-power-up', randomPowerUpActivationString);
		// And wait 10 seconds before cancelling the trigger
		setTimeout(() => {
			if (this.awaitingPowerUpReply) {
				this.server
					.to(Object.keys(this.players)[0])
					.emit('power-up-missed', randomPowerUpActivationString);
				this.server
					.to(Object.keys(this.players)[1])
					.emit('power-up-missed', randomPowerUpActivationString);
				this.awaitingPowerUpReply = false;
			}
		}, 10000);
	}

	// Powerup was activated by a player
	activatePowerUp(playerSocketId: string) {
		// We're not waiting for a reply anymore
		this.awaitingPowerUpReply = false;

		// Find opponent's socketId
		const [opponentSocketId] = Object.keys(this.players).filter(
			(currentSocketId) => currentSocketId != playerSocketId,
		);

		// Randomize powerup choice and duration
		const POWER_UP_TYPES = 3;
		const MIN_DURATION = 15;
		const MAX_DURATION = 30;

		// randomize powerup choice
		const powerUpChoice = Math.floor(Math.random() * POWER_UP_TYPES) + 1;
		const powerUpDuration =
			Math.floor(Math.random() * (MAX_DURATION - MIN_DURATION + 1)) +
			MIN_DURATION;

		switch (powerUpChoice) {
			case 1:
				this.applyPowerUp(playerSocketId, 'height', 2, powerUpDuration);
				return 'large paddle';
			case 2:
				this.applyPowerUp(opponentSocketId, 'height', 0.5, powerUpDuration);
				return 'small paddle';
			case 3:
				this.applyPowerUp(opponentSocketId, 'speed', 0.2, powerUpDuration);
				return 'slow paddle';
		}
	}

	applyPowerUp(
		socketId: string,
		attribute: string,
		factor: number,
		duration: number,
	) {
		this.players[socketId][attribute] *= factor;
		setTimeout(() => {
			this.players[socketId][
				`reset${attribute.charAt(0).toUpperCase() + attribute.slice(1)}`
			]();
		}, duration * 1000);
	}

	getRandomChar(): string {
		// Generate a random ASCII code between 97 ('a') and 122 ('z')
		const randomAsciiCode = Math.floor(Math.random() * 26) + 97;
		// Create a string from that code and return it
		return String.fromCharCode(randomAsciiCode);
	}

	generatePowerUpActivationString(): string {
		// Generate a random length between 2 and 4
		const length = Math.floor(Math.random() * 2) + 2;

		// Initialize an empty string
		let finalString = '';

		// Loop to append random characters to the string
		for (let i = 0; i < length; ++i) finalString += this.getRandomChar();
		return finalString;
	}

	// Start the game simulation with an interval of 50ms
	private startGameSimulation() {
		const gameStateInterval = 1000 / 60;

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

	private startBroadcasting() {
		const gameBroadcastIntervalSpeed = 10;
		if (this.gameHasStarted && !this.gameBroadcastInterval) {
			this.gameBroadcastInterval = setInterval(() => {
				this.broadcastGameState();
			}, gameBroadcastIntervalSpeed);
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
