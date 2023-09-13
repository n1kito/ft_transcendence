import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useState,
} from 'react';

export interface IGameDataProps {
	gameIsPlaying: boolean;
	player1IsReady: boolean;
	player2IsReady: boolean;
	//TODO: add other properties
}

interface GameContextType {
	gameData: IGameDataProps | undefined;
	updateGameData: (updates: Partial<IGameDataProps>) => void;
	resetGameData: () => void;
}

export const GameContext = createContext<GameContextType>({
	gameData: undefined,
	updateGameData: () => {
		throw new Error('setGameData function must be overriden');
	},
	resetGameData: () => {
		throw new Error('resetGameData function must be overriden');
	},
});

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	// Initial state of the gameData
	const initialState: IGameDataProps = {
		gameIsPlaying: false,
		player1IsReady: false,
		player2IsReady: false,
	};

	// Actual state of the context
	// We use our initial state above to initialize it
	const [gameData, setGameData] = useState<IGameDataProps>(initialState);

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateGameData = (updates: Partial<IGameDataProps>) => {
		setGameData((prevGameData) => ({
			...prevGameData,
			...updates,
		}));
	};

	// Helper function to reset the game state to its initial state in one function call
	const resetGameData = () => {
		setGameData(initialState);
	};

	// Return a provider that will now make the gameData and its helper functions available
	// for all its children components
	return (
		<GameContext.Provider value={{ gameData, updateGameData, resetGameData }}>
			{children}
		</GameContext.Provider>
	);
};
