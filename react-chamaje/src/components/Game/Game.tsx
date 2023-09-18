import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Game.css';
import Window from '../Window/Window';
import Button from '../Shared/Button/Button';
import Tooltip from '../Shared/Tooltip/Tooltip';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import { Socket, io } from 'socket.io-client';
import { GameSocket } from '../../services/GameSocket';
import GameOverlay from './Components/GameOverlay/GameOverlay';
import { GameContext } from '../../contexts/GameContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import { join } from 'path';
import GameCanvas from './Components/GameCanvas/GameCanvas';
import { Game as GameObject } from './Components/GameCanvas/Entities/Game';

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

// TODO: fix this
// setTimeout(() => {
// 	console.log("Let's say that the user has left for goood");
// 	// if the user has not reconnected after 10 seconds
// 	if (!this.userSockets[socketOwnerId]) {
// 		// let all their opponents know that user will not be coming back
// 		this.notifyCurrentOpponents(client, socketOwnerId, 'opponent-left');
// 		// remove the user from all their active opponent rooms
// 		this.gameService.removePlayerFromOpponentRooms(socketOwnerId);
// 	}
// }, 10000);
// interface IGameRoomProps {
// 	roomId: number; // TODO: this should not be given by the props, it should instead be found by the game component
// 	// we should only need to tell the component who we are trying to play against
// 	opponentLogin: string;
// 	opponentAvatar: string; // TODO: this should also not be given when opening the component
// }

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
	// Canvas ref
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	// gameInstance
	const gameInstance = useRef<GameObject | null>(null);

	// // Canvas states
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
		joinRoom,
		requestOpponentInfo,
		setPlayer1AsReady,
	} = useGameSocket();
	// Create a ref to out context's socket

	useEffect(() => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx)
				gameInstance.current = new GameObject(
					canvasRef,
					ctx,
					broadcastPlayerPosition,
				);
		}

		return () => {
			gameInstance.current?.cancelGameLoop();
			gameInstance.current?.removeEventListeners();
			eraseGameData(); // TODO: this does not seem to log shit
		};
	}, []);

	useEffect(() => {
		if (gameData.gameIsPlaying) gameInstance.current?.gameLoop();
		else gameInstance.current?.cancelGameLoop();
	}, [gameData.gameIsPlaying]);

	// If we're connected to the socket and don't have a room, ask for one
	useEffect(() => {
		if (gameData.connectedToServer && !gameData.roomId) {
			joinRoom();
		}
	}, [gameData.connectedToServer, gameData.roomId]);

	// if we're in a room and it's full, ask for our opponent's information
	useEffect(() => {
		if (gameData.roomIsFull) {
			requestOpponentInfo();
		}
	}, [gameData.roomIsFull]);

	// notify the server when player is ready
	useEffect(() => {
		if (gameData.player1Ready) setPlayer1AsReady();
	}, [gameData.player1Ready]);

	useEffect(() => {
		if (gameData.player1Ready && gameData.player2Ready)
			updateGameData({ gameIsPlaying: true });
	}, [gameData.player1Ready, gameData.player2Ready]);

	//

	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
			{/* TODO: add the player information above the canvas game */}
			<div className={`game-wrapper`}>
				{!gameData.gameIsPlaying && <GameOverlay />}
				<GameCanvas
					// paddle1Props={paddle1Position}
					// paddle2Props={paddle2Position}
					// ballProps={ballPosition}
					canvasProps={canvasSize}
					ref={canvasRef}
				/>
			</div>
		</Window>
	);
};

export default Game;
