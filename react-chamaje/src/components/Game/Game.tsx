import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import './Game.css';
import Window from '../Window/Window';
import { Paddle } from './Entities/Paddle';
import { Ball } from './Entities/Ball';
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
	const { accessToken } = useAuth();
	const { userData } = useContext(UserContext);

	/*
	░█▀▀░▀█▀░█▀█░▀█▀░█▀▀░█▀▀
	░▀▀█░░█░░█▀█░░█░░█▀▀░▀▀█
	░▀▀▀░░▀░░▀░▀░░▀░░▀▀▀░▀▀▀ 
	*/

	// const [socket, setSocket] = useState<GameSocket | null>(null);
	// Import the game context, so it can be used everywhere
	const { gameData, updateGameData, resetGameData } = useContext(GameContext);

	const [playerInRoom, setPlayerInRoom] = useState(false);
	const [settingsWindowVisible, setSettingWindowVisible] = useState(true);
	const [gameIsRunning, setGameIsRunning] = useState(false);
	const [gameHasTwoPlayers, setGameHasTwoPlayers] = useState(false);
	const [connectedToServer, setConnectedToServer] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('');
	const [player1Ready, setPlayer1Ready] = useState(false);
	const [player2Ready, setPlayer2Ready] = useState(false);
	const [gameCanStart, setGameCanStart] = useState(false);
	const [userWonGame, setUserWonGame] = useState(false);
	const [userLostGame, setUserLostGame] = useState(false);
	const [opponentInfo, setOpponentInfo] = useState<
		{ login: string; image: string } | undefined
	>(undefined);
	const [opponentIsReconnecting, setOpponentIsReconnecting] = useState(false);

	// Instantiate a websocket connection that will be kept through renders
	const gameSocket = useMemo(() => {
		return new GameSocket(
			userData?.id || 123,
			accessToken,
			setPlayerInRoom,
			setPlayer2Ready,
			setGameCanStart,
			setConnectedToServer,
			setConnectionStatus,
			setOpponentInfo,
			setOpponentIsReconnecting,
		);
	}, []);

	/*
	░█▀▀░█▀█░█▄█░█▀▀░░░█░░░█▀█░█▀▀░▀█▀░█▀▀
	░█░█░█▀█░█░█░█▀▀░░░█░░░█░█░█░█░░█░░█░░
	░▀▀▀░▀░▀░▀░▀░▀▀▀░░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀
	*/

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		// Check that the canvas loaded
		if (!canvasRef.current) return;
		const canvasDrawingCtx = canvasRef.current.getContext('2d');
		if (!canvasDrawingCtx) return;

		// Few variables
		const initialPaddleHeight = 0.2 * canvasRef.current.height;
		const initialPaddleWidth = 5;
		const initialBallWidth = 10;

		// Create my two paddles
		const paddlePlayer1 = new Paddle(
			0,
			canvasRef.current.height / 2 - initialPaddleHeight / 2,
			initialPaddleWidth,
			initialPaddleHeight,
		);
		const paddlePlayer2 = new Paddle(
			canvasRef.current.width - initialPaddleWidth,
			canvasRef.current.height / 2 - initialPaddleHeight / 2,
			initialPaddleWidth,
			initialPaddleHeight,
		);
		// Create my ball
		const ball = new Ball(
			canvasRef.current.width / 2,
			canvasRef.current.height / 2,
			initialBallWidth,
		);

		// Make the window listen for keys
		// TODO: should only do something if the gameWindow is in focus
		window.addEventListener('keydown', function (e) {
			// keys[e.key] = true;
			if (e.key === 'ArrowUp') {
				paddlePlayer1.direction = -1;
				// Prevent the key's default behavior, so it does not scroll down for example
				e.preventDefault();
			}
			if (e.key === 'ArrowDown') {
				paddlePlayer1.direction = 1;
				// Prevent the key's default behavior, so it does not scroll down for example
				e.preventDefault();
			}
		});
		window.addEventListener('keyup', function (e) {
			// delete keys[e.key];
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
				paddlePlayer1.direction = 0;
		});

		// This is the loop that continualy updates our game
		const loop = () => {
			// Modify the state of the game based on user input
			updateCoordinates();
			// Draw the current state of objects onto the screen
			drawCanvas();
			// Request the next frame
			window.requestAnimationFrame(loop);
		};

		const drawCanvas = () => {
			clearCanvas();
			drawNet();
			ball.draw(canvasDrawingCtx);
			drawPaddles();
		};

		// Update the position of each element
		const updateCoordinates = () => {
			if (canvasRef.current) {
				// Update paddles position
				paddlePlayer1.move(canvasRef.current);
				// paddlePlayer2.move();
				// Update ball position
				ball.move();
				// Check that the ball does not collide with a paddle
				if (
					ball.paddleBounceCheck(paddlePlayer1, 'left') ||
					ball.paddleBounceCheck(paddlePlayer2, 'right')
				)
					return;
				// Check that the ball has not collided with a wall
				ball.wallCollisionCheck(canvasRef.current);
				// ball.paddleBounceCheck(paddlePlayer2);
			}
		};
		// Remove everything that was on the canvas
		const clearCanvas = () => {
			if (canvasDrawingCtx && canvasRef.current)
				canvasDrawingCtx.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height,
				);
		};
		const drawPaddles = () => {
			paddlePlayer1.draw(canvasDrawingCtx);
			paddlePlayer2.draw(canvasDrawingCtx);
		};
		const drawNet = () => {
			if (canvasDrawingCtx && canvasRef.current) {
				canvasDrawingCtx.fillStyle = gradient;
				canvasDrawingCtx.fillRect(
					canvasRef.current?.width / 2 - netWidth / 2,
					0,
					netWidth,
					canvasRef.current.height,
				);
				canvasDrawingCtx.fillStyle = 'white';
			}
		};
		// TODO: couldn't this be moved somewhere else ?
		let gradient: CanvasGradient;
		const netWidth = 3;
		const setupCanvasStyle = () => {
			if (!canvasDrawingCtx || !canvasRef.current) return;
			canvasDrawingCtx.fillStyle = 'white';
			canvasDrawingCtx.shadowColor = 'pink';
			canvasDrawingCtx.shadowBlur = 20;
			canvasDrawingCtx.shadowOffsetX = 0;
			canvasDrawingCtx.shadowOffsetY = 0;

			// Setup the gradient
			gradient = canvasDrawingCtx.createLinearGradient(
				canvasRef.current.width / 2 - netWidth / 2,
				0,
				canvasRef.current.width / 2 + netWidth / 2,
				canvasRef.current.height,
			);
			// Add colors to it
			gradient.addColorStop(0.1086, 'rgba(194, 255, 182, 0.69)');
			gradient.addColorStop(0.5092, 'rgba(254, 164, 182, 1.00)');
			gradient.addColorStop(0.5093, '#FFA3B6');
			gradient.addColorStop(0.7544, '#DDA9FF');
			gradient.addColorStop(1.0, '#A2D1FF'); // Adjusted to the maximum allowable value of 1.0
		};
		setupCanvasStyle();
		loop();
	}, []);

	/*
	░█▀▄░█▀█░█▀█░█▄█░░░█░░░█▀█░█▀▀░▀█▀░█▀▀
	░█▀▄░█░█░█░█░█░█░░░█░░░█░█░█░█░░█░░█░░
	░▀░▀░▀▀▀░▀▀▀░▀░▀░░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀
	*/

	// This was using a fetch request to ask for a room assignment.
	// You will find below that I've decided to do it over websockets instead
	// useEffect(() => {
	// 	// If the component was mounted with no room information (from the desktop icon)
	// 	// we need to request a roomId to play in, either an empty room or a room with someone
	// 	// already waiting in it
	// 	if (gameRoomInfo == undefined) {
	// 		const findRoom = async () => {
	// 			// Feth the user data from the server
	// 			try {
	// 				// user/me
	// 				const response = await fetch('/api/game/assign-room', {
	// 					method: 'GET',
	// 					credentials: 'include',
	// 					headers: {
	// 						Authorization: `Bearer ${accessToken}`,
	// 					},
	// 				});
	// 				if (response.ok) {
	// 					const data = await response.json();
	// 					console.log(`🏓 Assigned to room #${data.roomId}`);
	// 					setRoomId(data.roomId);

	// 					// Initiate websocket connection
	// 					const newSocket = new GameSocket(123);
	// 					setSocket(newSocket);
	// 				} else {
	// 					console.error(`Could not get room Id`);
	// 				}
	// 			} catch (error) {
	// 				console.error('Error: ', error);
	// 			}
	// 		};
	// 		findRoom();
	// 	}
	// 	// Cleanup logic for disconnecting the socket when game component unmounts
	// 	return () => {
	// 		// TODO: disconnect the socket on unmount
	// 		// if (socket) socket.disconnect();
	// 	};
	// }, []);

	useEffect(() => {
		try {
			// Initiate the socket connection
			// It checks itself for errors and displays a message to the user directly
			gameSocket.initiateSocketConnection();
		} catch (error) {
			console.error(error);
		}
		// const setupSocket = async () => {
		// 	try {
		// 		// If the component was mounted with no room information (from the desktop icon)
		// 		// we need to request a roomId to play in, either an empty room or a room with someone
		// 		// already waiting in it
		// 		// Create a websocket connection
		// 		const gameSocket = new GameSocket(
		// 			userData?.id || 123,
		// 			accessToken,
		// 			setPlayer1Ready,
		// 			setPlayer2Ready,
		// 		);
		// 		if (!gameSocket)
		// 			console.error('Could not instantiate web socket for pong game');
		// 		setSocket(gameSocket);
		// 	} catch (error) {
		// 		console.error('Could not initiate socket connection: ', error);
		// 	}
		// };
		// setupSocket();

		return () => {
			gameSocket.log('Left the game !');
			// Cleanup logic: disconnect the socket
			if (gameSocket) gameSocket.disconnect();
		};
	}, []);

	// Once we are connected to the server, try to join a room
	useEffect(() => {
		// If we were not connected to the server, do nothing
		if (!connectedToServer) return;

		// Otherwise, try to join a room
		try {
			// Ask the server to join a room either with an opponent (or alone)
			gameSocket.joinGameRoom(opponentId);
			// gameSocket.joinGameRoom();
		} catch (error) {
			console.error(error);
		}
	}, [connectedToServer]);

	// useEffect(() => {
	// 	try {
	// 		const findRoom = async () => {
	// 			if (!gameSocket) return;
	// 			console.log({ gameSocket });
	// 			// Find a room to be in
	// 			// User opened the game from the desktop and do not have an opponent in mind
	// 			if (opponentId == undefined) {
	// 				const assignedRoomId = await gameSocket.findSoloGameRoom();
	// 				console.log(`Player was assigned room #${assignedRoomId}`);
	// 				setRoomId(assignedRoomId);
	// 				gameSocket.joinRoom();
	// 			}
	// 			// User knows who they're playing against and need a room #
	// 			else if (opponentId > 0) {
	// 				console.log('%/* Styling the Game component */
	// 				cTrying to find a room for two...', 'color: purple');
	// 			}
	// 			const assignedRoomId = await gameSocket.findRoomForTwo(
	// 				opponentId || -1,
	// 			);
	// 		};
	// 		console.log('findRoom triggered');
	// 		findRoom();
	// 	} catch (error) {
	// 		console.error('Could not find game room: ', error);
	// 	}
	// }, [gameSocket]);

	// Check if the game can start
	useEffect(() => {
		if (player1Ready && player2Ready) setGameCanStart(true);
	}, [player1Ready, player2Ready]);

	// TODO: this is an issue on load because on gameOverlay the
	// message that you won or lost depends on either of these two states being true
	// // Update the value of UserLostGame based on updates to userWonGame
	// useEffect(() => {
	// 	setUserLostGame(!userWonGame);
	// }, [userLostGame]);

	useEffect(() => {
		console.log('Opponent info: ', opponentInfo);
	}, [opponentInfo]);

	useEffect(() => {
		if (player1Ready) gameSocket.notifyPlayer1Ready();
	}, [player1Ready]);

	useEffect(() => {
		setGameCanStart(player1Ready && player2Ready);
	}, [player1Ready, player2Ready]);

	useEffect(() => {
		console.log('Game can start: ', gameCanStart);
	}, [gameCanStart]);

	/*
	░█░█░█▀▀░█▀▄░█▀▀░█▀█░█▀▀░█░█░█▀▀░▀█▀░░░█░░░█▀█░█▀▀░▀█▀░█▀▀
	░█▄█░█▀▀░█▀▄░▀▀█░█░█░█░░░█▀▄░█▀▀░░█░░░░█░░░█░█░█░█░░█░░█░░
	░▀░▀░▀▀▀░▀▀░░▀▀▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░░▀░░░░▀▀▀░▀▀▀░▀▀▀░▀▀▀░▀▀▀
	*/

	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
				{/* TODO: add the player information above the canvas game */}
				<div className={`game-wrapper`}>
					{!gameCanStart && (
						<GameOverlay
							connectedToServer={connectedToServer}
							connectionStatus={connectionStatus}
							userWonGame={userWonGame}
							userLostGame={userLostGame}
							playerInRoom={playerInRoom}
							player1Ready={player1Ready}
							player2Ready={player2Ready}
							setPlayer1Ready={setPlayer1Ready}
							opponentInfo={opponentInfo}
							opponentIsReconnecting={opponentIsReconnecting}
						/>
					)}
					<canvas
						className="game-canvas"
						ref={canvasRef}
						width={700}
						height={500}
					>
						This browser doesnt support canvas technology, try another or
						update.
					</canvas>
				</div>
		</Window>
	);
};

export default Game;
