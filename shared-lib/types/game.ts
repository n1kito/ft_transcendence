export interface IGamePaddleProps {
	x: number;
	y: number;
	width: number;
	height: number;
	direction: number;
	speed: number;
}

export interface IGameBallPosition {
	x: number;
	y: number;
	width: number;
	height: number;
	xVelocity: number;
	yVelocity: number;
	speed: number;
}

export type IPlayerInformation = {
	login: string;
	image: string;
};

export interface IPlayerState {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number;
	score: number;
}

export interface IBallState {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface IGameState {
	player1: IPlayerState;
	player2: IPlayerState;
	ball: IBallState;
}

export interface IPlayerMovementPayload {
	direction: 'up' | 'down' | 'immobile';
}
