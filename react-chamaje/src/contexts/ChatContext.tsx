export {}
// import React, {
// 	Dispatch,
// 	SetStateAction,
// 	createContext,
// 	useEffect,
// 	useState,
// } from 'react';

// // interface IPlayerState {
// // 	x: number;
// // 	y: number;
// // 	width: number;
// // 	height: number;
// // 	score: number;
// // }
// // interface IBallState {
// // 	x: number;
// // 	y: number;
// // 	width: number;
// // 	height: number;
// // }

// // export interface IGameState {
// // 	player1: IPlayerState;
// // 	player2: IPlayerState;
// // 	ball: IBallState;
// // 	// general: IGeneralAssetsState;
// // }

// // export interface IChatDataProps {
// // 	socket: Socket | undefined;
// // 	// gameCanStart: boolean;
// // 	gameIsPlaying: boolean;
// // 	player1Ready: boolean;
// // 	player2Ready: boolean;
// // 	roomId: string | undefined;
// // 	userWonGame: boolean;
// // 	userLostGame: boolean;
// // 	opponentInfo: IPlayerInformation | undefined;
// // 	opponentIsReconnecting: boolean;
// // 	gameState: IGameState | undefined;
// // 	// Connection information
// // 	connectedToServer: boolean;
// // 	connectionErrorStatus: string | null;
// // 	//TODO: add other properties
// // }

// export interface IChatDataProps {

// }

// export interface IMessage {
// 	chatId: number;
// 	sentById: number;
// 	sentAt: Date;
// 	content: string;
// 	login: string;
// 	avatar?: string;
// }

// // Initial state of the chatData
// const defaultChatState: IChatDataProps = {
// 	socket: undefined,

// };

// interface GameContextType {
// 	gameData: IChatDataProps;
// 	updateGameData: (updates: Partial<IChatDataProps>) => void;
// 	eraseGameData: () => void;
// 	resetGameData: () => void;
// }

// export const GameContext = createContext<GameContextType>({
// 	gameData: defaultGameState,
// 	updateGameData: () => {
// 		throw new Error('setGameData function must be overriden');
// 	},
// 	eraseGameData: () => {
// 		throw new Error('resetGameData function must be overriden');
// 	},
// 	resetGameData: () => {
// 		throw new Error('resetGameData function must be overriden');
// 	},
// });

// export const GameProvider = ({ children }: { children: React.ReactNode }) => {
// 	// Actual state of the context
// 	// We use our initial state above to initialize it
// 	const [gameData, setGameData] = useState<IChatDataProps>(defaultGameState);

// 	// TODO: remove this and corresponding logs
// 	// Logs the updates to gameData as they happen
// 	useEffect(() => {
// 		const gameDataLog = { ...gameData, socket: 'not loggable' };
// 		console.log(
// 			`%c GameData %c ${JSON.stringify(gameDataLog, null, 4)}`,
// 			'color: yellow; background:magenta',
// 			'',
// 		);
// 	}, [gameData]);

// 	// We want a helper function that will allow us to update one, many or all
// 	// properties of the game state without having to override the entire thing manually
// 	const updateGameData = (updates: Partial<IChatDataProps>) => {
// 		setGameData((prevGameData: IChatDataProps) => ({
// 			...prevGameData,
// 			...updates,
// 		}));
// 		if ('socket' in updates) {
// 			logContext(`socket ${updates.socket != undefined ? 'added' : 'removed'}`);
// 		} else {
// 			logContext(JSON.stringify(updates, null, 4));
// 		}
// 	};

// 	// Helper function to reset the game state to its initial state in one function call
// 	const eraseGameData = () => {
// 		logContext('erase the current gameData, including the socket');
// 		setGameData(defaultGameState);
// 	};

// 	const resetGameData = () => {
// 		logContext('reset the gameData context, excluding the socket');
// 		const resetGameValues: Partial<IChatDataProps> = defaultGameState;
// 		delete resetGameValues.socket;
// 		delete resetGameValues.connectedToServer;
// 		updateGameData(resetGameValues);
// 	};

// 	const logContext = (content: string) => {
// 		console.log(
// 			`%c GameDataUpdated %c ${content}`,
// 			'background:blue; color:turquoise',
// 			'',
// 		);
// 	};

// 	// Return a provider that will now make the gameData and its helper functions available
// 	// for all its children components
// 	return (
// 		<GameContext.Provider
// 			value={{ gameData, updateGameData, resetGameData, eraseGameData }}
// 		>
// 			{children}
// 		</GameContext.Provider>
// 	);
// };