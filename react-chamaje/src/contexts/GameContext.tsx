import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from 'react';
import { Socket } from 'socket.io-client';
import { IPlayerInformation } from '../../../shared-lib/types/game';
import { IGameState } from '../../../shared-lib/types/game';

interface IPlayerState {
	x: number;
	y: number;
	width: number;
	height: number;
	score: number;
}
interface IBallState {
	x: number;
	y: number;
	width: number;
	height: number;
}
interface IGeneralAssetsState {}

export interface IGameDataProps {
	socket: Socket | undefined;
	// gameCanStart: boolean;
	gameIsPlaying: boolean;
	player1Ready: boolean;
	player2Ready: boolean;
	roomId: string | undefined;
	userWonGame: boolean;
	userLostGame: boolean;
	opponentInfo: IPlayerInformation | undefined;
	opponentIsReconnecting: boolean;
	gameState: IGameState | undefined;
	// Connection information
	connectedToServer: boolean;
	connectionErrorStatus: string | null;
	//TODO: add other properties
}

// Initial state of the gameData
const defaultGameState: IGameDataProps = {
	socket: undefined,
	// gameCanStart: false,
	gameIsPlaying: false,
	player1Ready: false,
	player2Ready: false,
	roomId: undefined,
	userWonGame: false,
	userLostGame: false,
	opponentInfo: undefined,
	opponentIsReconnecting: false,
	gameState: undefined,
	// Connection information
	connectedToServer: false,
	connectionErrorStatus: null,
};

interface GameContextType {
	gameData: IGameDataProps;
	updateGameData: (updates: Partial<IGameDataProps>) => void;
	eraseGameData: () => void;
	resetGameData: () => void;
}

export const GameContext = createContext<GameContextType>({
	gameData: defaultGameState,
	updateGameData: () => {
		throw new Error('setGameData function must be overriden');
	},
	eraseGameData: () => {
		throw new Error('resetGameData function must be overriden');
	},
	resetGameData: () => {
		throw new Error('resetGameData function must be overriden');
	},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	// Actual state of the context
	// We use our initial state above to initialize it
	const [gameData, setGameData] = useState<IGameDataProps>(defaultGameState);

	// TODO: remove this and corresponding logs
	// Logs the updates to gameData as they happen
	// useEffect(() => {
	// 	const gameDataLog = { ...gameData, socket: 'not loggable' };
	// 	console.log(
	// 		`%c GameData %c ${JSON.stringify(gameDataLog, null, 4)}`,
	// 		'color: yellow; background:magenta',
	// 		'',
	// 	);
	// }, [gameData]);

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateGameData = (updates: Partial<IGameDataProps>) => {
		setGameData((prevGameData: IGameDataProps) => ({
			...prevGameData,
			...updates,
		}));
		// if ('socket' in updates) {
		// 	logContext(`socket ${updates.socket != undefined ? 'added' : 'removed'}`);
		// } else {
		// 	logContext(JSON.stringify(updates, null, 4));
		// }
	};

	// Helper function to reset the game state to its initial state in one function call
	const eraseGameData = () => {
		logContext('erase the current gameData, including the socket');
		setGameData(defaultGameState);
	};

	const resetGameData = () => {
		logContext('reset the gameData context, excluding the socket');
		const resetGameValues: Partial<IGameDataProps> = defaultGameState;
		delete resetGameValues.socket;
		delete resetGameValues.connectedToServer;
		updateGameData(resetGameValues);
	};

	const logContext = (content: string) => {
		console.log(
			`%c GameDataUpdated %c ${content}`,
			'background:blue; color:turquoise',
			'',
		);
	};

	// Return a provider that will now make the gameData and its helper functions available
	// for all its children components
	return (
		<GameContext.Provider
			value={{ gameData, updateGameData, resetGameData, eraseGameData }}
		>
			{children}
		</GameContext.Provider>
	);
};
