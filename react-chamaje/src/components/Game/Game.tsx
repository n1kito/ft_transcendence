import React, { useContext, useEffect, useRef, useState } from 'react';
import './Game.css';
import Window from '../Window/Window';
import GameOverlay from './Components/GameOverlay/GameOverlay';
import { GameContext } from '../../contexts/GameContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import GameCanvas from './Components/GameCanvas/GameCanvas';
import { GameRenderer } from './Components/GameCanvas/Entities/GameRenderer';

export interface ICanvasProps {
	width: number;
	height: number;
}

export interface IPaddleProps {
	x: number;
	y: number;
	height: number;
	width: number;
}

export interface IBallProps {
	x: number;
	y: number;
	radius: number;
}

interface IGameProps {
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
	// gameRoomInfo?: IGameRoomProps;
	opponentId?: number | undefined;
}

const Game: React.FC<IGameProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	opponentId = undefined,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const gameInstance = useRef<GameRenderer | null>(null);
	// TODO: might not be necessary since I don't change the actual canvas size
	// upon resize, it should actually be just set to 100%
	const [canvasSize, setCanvasSize] = useState<ICanvasProps>({
		width: 700,
		height: 500,
	});

	// Import the game context, so it can be used everywhere
	const { gameData, updateGameData, resetGameData, eraseGameData } =
		useContext(GameContext);

	// use our socket hook
	const {
		broadcastPlayerPosition,
		setPlayer1AsReady: notifyPlayerIsReady,
		askForAnotherOpponent,
	} = useGameSocket();
	// Create a ref to out context's socket

	useEffect(() => {
		// If the HTML canvas element has loaded,
		// we generate an instance of the GameRenderer class/engine
		if (canvasRef && canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx)
				gameInstance.current = new GameRenderer(
					canvasRef,
					ctx,
					broadcastPlayerPosition,
				);
		}

		return () => {
			gameInstance.current?.stopGame();
			gameInstance.current?.removeEventListeners();
			eraseGameData(); // TODO: this does not seem to log shit
		};
	}, []);

	useEffect(() => {
		if (gameData.gameIsPlaying) gameInstance.current?.startGame();
		else gameInstance.current?.stopGame();
	}, [gameData.gameIsPlaying]);

	// notify the server when player is ready
	useEffect(() => {
		if (gameData.player1Ready) notifyPlayerIsReady();
	}, [gameData.player1Ready]);

	// monitor if user wants new opponent
	useEffect(() => {
		if (gameData.userWantsNewOpponent) {
			askForAnotherOpponent();
			updateGameData({ userWantsNewOpponent: false });
		}
	}, [gameData.userWantsNewOpponent]);

	useEffect(() => {
		// Everytime the server sends a state update, we need to apply it
		gameInstance.current?.gameLogic.gameStateServerUpdate(gameData.gameState);
	}, [gameData.gameState]);

	return (
		<Window
			windowTitle="Game"
			onCloseClick={() => {
				console.log('Player intentionally closed the window.');
				onCloseClick();
			}}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
			{/* TODO: add the player information above the canvas game */}
			<div className="game-wrapper">
				{!gameData.gameIsPlaying && <GameOverlay />}
				<GameCanvas canvasProps={canvasSize} ref={canvasRef} />
			</div>
		</Window>
	);
};

export default Game;
