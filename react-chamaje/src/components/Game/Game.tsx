import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from 'src/contexts/ChatContext';
import { GameContext } from '../../contexts/GameContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import Window from '../Window/Window';
import { GameRenderer } from './Components/GameCanvas/Entities/GameRenderer';
import GameCanvas from './Components/GameCanvas/GameCanvas';
import GameOverlay from './Components/GameOverlay/GameOverlay';
import GamePowerUp from './Components/GamePowerUp/GamePowerUp';
import './Game.css';

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
	opponentLogin?: string | undefined;
}

const Game: React.FC<IGameProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	opponentLogin = undefined,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const gameInstance = useRef<GameRenderer | null>(null);
	const canvasSize: ICanvasProps = {
		width: 700,
		height: 500,
	};

	// Import the game context, so it can be used everywhere
	const { gameData, updateGameData, resetGameData } = useContext(GameContext);

	// use our socket hook
	const {
		sharePowerupSettingUpdate,
		// broadcastPlayerPosition,
		setPlayer1AsReady: notifyPlayerIsReady,
		askForAnotherOpponent,
		socketRef,
	} = useGameSocket({ opponentLogin });

	useEffect(() => {
		// If the HTML canvas element has loaded,
		// we generate an instance of the GameRenderer class/engine
		if (canvasRef && canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx)
				gameInstance.current = new GameRenderer(
					socketRef.current,
					canvasRef,
					ctx,
				);
		}
		//TODO: announce others i am in a game

		return () => {
			gameInstance.current?.stopGame();
			gameInstance.current?.removeEventListeners();
			resetGameData();
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

	// We're only sending powerupSettingUpdates if we have an opponent
	// Otherwise the button is disabled anyway
	useEffect(() => {
		if (gameData.opponentInfo) sharePowerupSettingUpdate();
	}, [gameData.userPowerupsDisabled]);

	return (
		<Window
			initialWindowPosition={{ top: 25, left: 25 }}
			windowTitle="Game"
			onCloseClick={() => {
				onCloseClick();
			}}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
			<div className="game-wrapper">
				{!gameData.gameIsPlaying && <GameOverlay />}
				{gameData.gameIsPlaying && gameData.gamePowerUp && <GamePowerUp />}
				<GameCanvas canvasProps={canvasSize} ref={canvasRef} />
			</div>
		</Window>
	);
};

export default Game;
