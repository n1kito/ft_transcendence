import { useContext, useEffect, useRef } from 'react';
import { UserContext } from '../contexts/UserContext';
import { GameContext } from '../contexts/GameContext';
import { Socket, io } from 'socket.io-client';
import useAuth from './userAuth';
import type { IPlayerInformation } from '../../../shared-lib/types/game';
import { IPlayerMovementPayload } from 'shared-lib/types/game';

interface IGameSocketProps {
	opponentLogin?: string | undefined;
}

export const useGameSocket = ({ opponentLogin }: IGameSocketProps) => {
	// Import necessary contexts
	const { isAuthentificated } = useAuth();
	const { userData } = useContext(UserContext);
	const { gameData, updateGameData } = useContext(GameContext);
	const { accessToken } = useAuth();

	// Set a socket Ref so I can use it anywhere in this hook
	const socketRef = useRef<Socket | null>(null);
	// on hook init
	useEffect(() => {
		if (!isAuthentificated) return;

		// Define queryParameters for the socket connection so we can
		// handle the case where there is no opponentLogin
		const queryParameters: { opponentLogin?: string } = {};
		if (opponentLogin) queryParameters.opponentLogin = opponentLogin;
		if (!socketRef.current) {
			// Initialize the socket connection
			socketRef.current = io({
				path: '/ws/game/',
				reconnection: false,
				auth: { accessToken: accessToken },
				query: queryParameters,
				transports: ['websocket'], // Limit to websocket only
				timeout: 2000, // Connection timeout in ms
			});
			// Store it in our context
			updateGameData({ socket: socketRef.current });
		}

		return () => {
			// socketLog('Disconnecting socket 🔴');
			socketRef.current?.disconnect();
		};
	}, [isAuthentificated]);

	// const socketLog = (logContent: string) => {
	// 	console.log(
	// 		`%c Socket %c ${logContent}`,
	// 		'background: purple; color: pink',
	// 		'',
	// 	);
	// };

	// Once a socket is assigned, setup our basic listeners
	useEffect(() => {
		if (!gameData.socket) return;

		gameData.socket.on('connect', () => {
			// socketLog('Connected to server ! 🟢 ');
		});
		gameData.socket.on('identification_ok', () => {
			// socketLog('Server authentification confirmed');
			updateGameData({ connectedToServer: true });
		});
		gameData.socket.on('connect_error', () => {
			updateGameData({
				connectionErrorStatus: 'Connection error, please refresh the page !',
			});
		});
		gameData.socket.on('connect_timeout', () => {
			updateGameData({ connectionErrorStatus: 'Connection timeout' });
		});
		gameData.socket.on('connection_limit_reached', () => {
			updateGameData({
				connectionErrorStatus:
					'Too many connections, please close some tabs and refresh !',
			});
		});
		gameData.socket.on('error', (error) => {
			updateGameData({
				connectionErrorStatus: `${error}`,
				opponentIsReconnecting: false,
			});
			if (gameData.socket && error === 'Rate Limit exceeded')
				gameData.socket.disconnect();
		});
		// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
		gameData.socket.on('disconnect', (reason) => {
			if (
				reason != 'io client disconnect' &&
				reason != 'io server disconnect'
			) {
				// the disconnection was initiated by the server, you need to reconnect manually
				if (gameData.socket) gameData.socket.connect();
			} else {
				if (gameData.socket) gameData.socket.disconnect();
				// socketLog('Disconnected from server ! ❌ ');
			}
		});

		gameData.socket.on('connection-closed', () => {
			updateGameData({
				connectionErrorStatus: 'You were disconnected !',
			});
		});

		gameData.socket.on('opponent-info', (information: IPlayerInformation) => {
			// socketLog(
			// `Received opponent's information: ${JSON.stringify(
			// information,
			// null,
			// 4,
			// )}`,
			// );
			updateGameData({ opponentInfo: information });
		});

		gameData.socket.on('opponent-is-ready', () => {
			updateGameData({ player2Ready: true });
		});

		gameData.socket.on('opponent-left', () => {
			updateGameData({
				player1Ready: false,
				player2Ready: false,
				opponentPowerupsDisabled: false,
				opponentInfo: undefined,
				gameIsPlaying: false,
				gameState: undefined,
			});
		});

		gameData.socket.on(
			'opponent-toggled-powerups',
			(opponentDisabledPowerups: boolean) => {
				updateGameData({ opponentPowerupsDisabled: opponentDisabledPowerups });
			},
		);

		gameData.socket.on('new-power-up', (powerUpKeySequence: string) => {
			updateGameData({ gamePowerUp: powerUpKeySequence });
		});

		// User receives this when the powerup was claimed by someone
		gameData.socket.on(
			'power-up-claimed',
			(data: { wonPowerUp: boolean; powerUpDescription: string }) => {
				updateGameData({
					powerUpClaimed: true,
					wonPowerUp: data.wonPowerUp,
					powerUpDescription: data.powerUpDescription,
				});
				setTimeout(() => {
					updateGameData({
						powerUpClaimed: false,
						gamePowerUp: undefined,
						wonPowerUp: false,
						powerUpDescription: undefined,
					});
				}, 3000);
			},
		);

		gameData.socket.on('power-up-missed', () => {
			updateGameData({
				gamePowerUp: undefined,
				powerUpDescription: undefined,
				wonPowerUp: false,
				powerUpClaimed: false,
			});
		});

		gameData.socket.on('game-started', () => {
			if (gameData.gameIsPlaying == false)
				updateGameData({ gameIsPlaying: true });
		});

		gameData.socket.on(
			'game-ended',
			(gameEndStatus: { gameHasWinner: boolean; userWon: boolean }) => {
				// socketLog('GAME ENDED');

				// Update necessary values from the game context
				updateGameData({
					gameIsPlaying: false,
					player1Ready: false,
					player2Ready: false,
					userPowerupsDisabled: false,
					opponentPowerupsDisabled: false,
					userWonGame: gameEndStatus.userWon,
					userLostGame: gameEndStatus.gameHasWinner && !gameEndStatus.userWon,
					gameState: undefined,
				});
			},
		);
	}, [gameData.socket]);

	/*
	░█░█░▀█▀░▀█▀░█░░░█▀▀
	░█░█░░█░░░█░░█░░░▀▀█
	░▀▀▀░░▀░░▀▀▀░▀▀▀░▀▀▀
	*/

	const notifyPlayerIsReady = () => {
		socketRef.current?.emit('player-is-ready', {
			userId: userData.id,
			roomId: gameData.roomId,
		});
	};

	const broadcastPlayerPosition = (payload: IPlayerMovementPayload) => {
		socketRef.current?.emit('player-moved', payload);
	};

	const askForAnotherOpponent = () => {
		socketRef.current?.emit('user-wants-new-opponent');
	};

	const sharePowerupSettingUpdate = () => {
		socketRef.current?.emit(
			'powerup-setting-update',
			gameData.userPowerupsDisabled,
		);
	};

	const startGame = () => {
		socketRef.current?.emit('game started');
	};

	return {
		socketRef,
		sharePowerupSettingUpdate,
		broadcastPlayerPosition,
		setPlayer1AsReady: notifyPlayerIsReady,
		startGame,
		askForAnotherOpponent,
	};
};
