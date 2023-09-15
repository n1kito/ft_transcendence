import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from 'react';
import { Socket } from 'socket.io-client';

interface IOpponentInfoProps {
	login: string;
	image: string;
}

export interface IGameDataProps {
	socket: Socket | undefined;
	gameCanStart: boolean;
	gameIsPlaying: boolean;
	player1Ready: boolean;
	player2Ready: boolean;
	roomIsFull: boolean;
	roomId: string | undefined;
	userWonGame: boolean;
	userLostGame: boolean;
	opponentInfo: IOpponentInfoProps | undefined;
	opponentIsReconnecting: boolean;
	// Connection information
	connectedToServer: boolean;
	connectionErrorStatus: string | null;
	//TODO: add other properties
}

// Initial state of the gameData
const defaultGameState: IGameDataProps = {
	socket: undefined,
	gameCanStart: true,
	gameIsPlaying: true,
	player1Ready: false,
	player2Ready: false,
	roomIsFull: false,
	roomId: undefined,
	userWonGame: false,
	userLostGame: false,
	opponentInfo: undefined,
	opponentIsReconnecting: false,
	// Connection information
	connectedToServer: false,
	connectionErrorStatus: null,
};

interface GameContextType {
	gameData: IGameDataProps;
	updateGameData: (updates: Partial<IGameDataProps>) => void;
	resetGameData: () => void;
}

export const GameContext = createContext<GameContextType>({
	gameData: defaultGameState,
	updateGameData: () => {
		throw new Error('setGameData function must be overriden');
	},
	resetGameData: () => {
		throw new Error('resetGameData function must be overriden');
	},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	// Actual state of the context
	// We use our initial state above to initialize it
	const [gameData, setGameData] = useState<IGameDataProps>(defaultGameState);

	useEffect(() => {
		const gameDataLog = { ...gameData, socket: 'not loggable' };
		console.log(
			`%c GameData %c ${JSON.stringify(gameDataLog, null, 4)}`,
			'color: yellow; background:magenta',
			'',
		);
	}, [gameData]);

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateGameData = (updates: Partial<IGameDataProps>) => {
		setGameData((prevGameData) => ({
			...prevGameData,
			...updates,
		}));
		if ('socket' in updates)
			console.log(
				`%c GameDataUpdated %c socket ${
					updates.socket != undefined ? 'added' : 'removed'
				}`,
				'background:blue; color:turquoise',
				'',
			);
		else {
			console.log(
				`%c GameDataUpdated %c ${JSON.stringify(updates, null, 4)}`,
				'background:blue; color:turquoise',
				'',
			);
		}
	};

	// Helper function to reset the game state to its initial state in one function call
	const resetGameData = () => {
		setGameData(defaultGameState);
	};

	// Return a provider that will now make the gameData and its helper functions available
	// for all its children components
	return (
		<GameContext.Provider value={{ gameData, updateGameData, resetGameData }}>
			{children}
		</GameContext.Provider>
	);
};
