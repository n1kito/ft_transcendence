import React, { useContext, useEffect, useRef, useState } from 'react';
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

interface IGameRoomProps {
	roomId: number;
	opponentLogin: string;
	opponentAvatar: string;
}

interface IGameProps {
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
	gameRoomInfo?: IGameRoomProps;
}

const Game: React.FC<IGameProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	gameRoomInfo = undefined,
}) => {
	const { accessToken } = useAuth();
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const { userData } = useContext(UserContext);

	/*
	░█▀▀░▀█▀░█▀█░▀█▀░█▀▀░█▀▀
	░▀▀█░░█░░█▀█░░█░░█▀▀░▀▀█
	░▀▀▀░░▀░░▀░▀░░▀░░▀▀▀░▀▀▀ 
	*/

	const [settingsWindowVisible, setSettingWindowVisible] = useState(true);
	const [gameIsRunning, setGameIsRunning] = useState(false);
	const [gameHasTwoPlayers, setGameHasTwoPlayers] = useState(false);
	const [player1Ready, setPlayer1Ready] = useState(false);
	const [player2Ready, setPlayer2Ready] = useState(false);
	const [userWonGame, setUserWonGame] = useState(false);
	const [userLostGame, setUserLostGame] = useState(true);

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
			if (e.key === 'ArrowUp') paddlePlayer1.direction = -1;
			if (e.key === 'ArrowDown') paddlePlayer1.direction = 1;
			// Prevent the key's default behavior, so it does not scroll down for example
			e.preventDefault();
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

	useEffect(() => {
		// If the component was mounted with no room information (from the desktop icon)
		// we need to request a roomId to play in, either an empty room or a room with someone
		// already waiting in it
		if (gameRoomInfo == undefined) {
			const findRoom = async () => {
				// Feth the user data from the server
				try {
					// user/me
					const response = await fetch('/api/game/assign-room', {
						method: 'GET',
						credentials: 'include',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					});
					if (response.ok) {
						const data = await response.json();
						// Set the user data in the context
						console.log(`You're in game room #${data.roomId}`);
					} else {
						console.log(`Could not get room Id`);
					}
				} catch (error) {
					console.error('Error: ', error);
				}
			};
			findRoom();
		}
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
				{(!player1Ready || !player2Ready) && (
					<div className="game-overlay-wrapper">
						{(userWonGame || userLostGame) && (
							<div className={`winner-announcement`}>
								WINNER: {userLostGame ? 'NOT ' : ''}YOU
							</div>
						)}
						<div className="game-settings-window-wrapper">
							<div className="game-settings-window-titlebar">
								Upcoming match
							</div>
							<div className="game-settings-window-content">
								<FriendBadge
									badgeTitle={userData?.login || '?'}
									badgeImageUrl={userData?.image || undefined}
									onlineIndicator={false}
									isActive={player1Ready}
								/>
								<span>VS</span>
								<FriendBadge isClickable={true} isActive={player2Ready} />
							</div>
						</div>
						<div
							className="game-play-button-wrapper"
							onMouseEnter={() => {
								setTooltipVisible(true);
							}}
							onMouseLeave={() => {
								setTooltipVisible(false);
							}}
						>
							<Tooltip
								isVisible={tooltipVisible && player1Ready && !player2Ready}
								position="bottom"
							>
								Waiting for your opponent to press "play"
							</Tooltip>
							<Button
								onClick={() => setPlayer1Ready(true)}
								disabled={player1Ready && !player2Ready}
							>
								play
							</Button>
						</div>
					</div>
				)}
				<canvas
					className="game-canvas"
					ref={canvasRef}
					width={700}
					height={500}
				>
					This browser doesnt support canvas technology, try another or update.
				</canvas>
			</div>
		</Window>
	);
};

export default Game;
