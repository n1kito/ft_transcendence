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

interface IGameRoomProps {
	roomId: number; // TODO: this should not be given by the props, it should instead be found by the game component
	// we should only need to tell the component who we are trying to play against
	opponentLogin: string;
	opponentAvatar: string; // TODO: this should also not be given when opening the component
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
	// Import the game context, so it can be used everywhere
	const { gameData, updateGameData, resetGameData } = useContext(GameContext);
	// use our socket hook
	const { disconnectSocket, joinRoom, requestOpponentInfo, setPlayer1AsReady } =
		useGameSocket();

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
			updateGameData({ gameCanStart: true });
	}, [gameData.player1Ready, gameData.player2Ready]);

	useEffect(() => {
		return () => {
			console.log('disconnecting socket');
			if (gameData.socket) console.log('gamedata still has a socket');
			disconnectSocket();
		};
	}, []);

	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
			{/* TODO: add the player information above the canvas game */}
			<div className={`game-wrapper`}>
				{!gameData.gameCanStart && <GameOverlay />}
				<GameCanvas />
			</div>
		</Window>
	);
};

export default Game;
