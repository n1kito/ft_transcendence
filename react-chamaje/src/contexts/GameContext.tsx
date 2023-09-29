import React, { createContext, useState } from 'react';
import { Socket } from 'socket.io-client';
import { IGameState, IPlayerInformation } from '../../../shared-lib/types/game';

export interface IGameDataProps {
	socket: Socket | undefined;
	gameIsPlaying: boolean;
	player1Ready: boolean;
	player2Ready: boolean;
	userPowerupsDisabled: boolean;
	opponentPowerupsDisabled: boolean;
	roomId: string | undefined;
	userWonGame: boolean;
	userLostGame: boolean;
	opponentInfo: IPlayerInformation | undefined;
	opponentIsReconnecting: boolean;
	gameState: IGameState | undefined;
	// Connection information
	connectedToServer: boolean;
	connectionErrorStatus: string | null;
	// User actions
	userWantsNewOpponent: boolean;
	gamePowerUp: string | undefined;
	powerUpClaimed: boolean;
	wonPowerUp: boolean;
	powerUpDescription: string | undefined;
}

// Initial state of the gameData
const defaultGameState: IGameDataProps = {
	gameIsPlaying: false,
	socket: undefined,
	player1Ready: false,
	player2Ready: false,
	userPowerupsDisabled: false,
	opponentPowerupsDisabled: false,
	roomId: undefined,
	userWonGame: false,
	userLostGame: false,
	opponentInfo: undefined,
	opponentIsReconnecting: false,
	gameState: undefined,
	// Connection information
	connectedToServer: false,
	connectionErrorStatus: null,
	// User actions
	userWantsNewOpponent: false,
	gamePowerUp: undefined,
	wonPowerUp: false,
	powerUpClaimed: false,
	powerUpDescription: undefined,
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

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateGameData = (updates: Partial<IGameDataProps>) => {
		setGameData((prevGameData: IGameDataProps) => ({
			...prevGameData,
			...updates,
		}));
		if ('socket' in updates) {
			logContext(`socket ${updates.socket != undefined ? 'added' : 'removed'}`);
		} else {
			logContext(JSON.stringify(updates, null, 4));
		}
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
