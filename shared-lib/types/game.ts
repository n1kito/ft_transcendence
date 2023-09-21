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

export interface ICurrentGameState {
	player1Score: number;
	player2Score: number;
	player1Paddle: IGamePaddleProps;
	player2Paddle: IGamePaddleProps;
	ball: IGameBallPosition;
	timestamp: Date;
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
	score: number;
}

export interface IBallState {
	x: number;
	y: number;
	width: number;
	height: number;
}
interface IGeneralAssetsState {}

export interface IGameState {
	player1: IPlayerState;
	player2: IPlayerState;
	ball: IBallState;
	// general: IGeneralAssetsState;
}
