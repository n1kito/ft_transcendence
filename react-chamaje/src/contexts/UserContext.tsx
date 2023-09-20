import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useEffect,
	useState,
} from 'react';
import WebSocketService from 'src/services/WebSocketService';

export interface IMatchHistory {
	player1Login: string;
	player1Score: number;
	player1Image: string;
	player2Login: string;
	player2Score: number;
	player2Image: string;
}

export interface UserData {
	// Define the structure of your user data
	// For example:
	id?: number;
	image: string;
	login: string;
	email: string;
	killCount?: number;
	chatSocket: WebSocketService | null;
	// TODO: the killcount was set as optional here to remove a compiling error with ProfileSettings.tsx but need to check it's ok
	// same for the other properties below
	winRate?: number;
	gamesCount?: number;
	bestFriendLogin?: string;
	rank?: number;
	targetLogin?: string;
	targetImage?: string;
	rivalLogin?: string;
	rivalImage?: string;
	bestieLogin?: string;
	bestieImage?: string;
	matchHistory?: IMatchHistory[];
	targetDiscoveredByUser?: boolean;
	// ... other properties
}

// interface UserContextType {
// 	userData: UserData | null;
// 	setUserData: Dispatch<SetStateAction<UserData | null>>;
// }

// Default content for an empty userdata object
const defaultUserData: UserData = {
	// User informatiom
	login: '',
	image: '',
	email: '',
	chatSocket: null,

	// Profile information
	gamesCount: 0,
	// Target
	targetDiscoveredByUser: false,
};

interface UserContextType {
	userData: UserData;
	updateUserData: (updates: Partial<UserData>) => void;
	resetUserData: () => void;
}

// TODO: should we setup a custom type here ?
export const UserContext = createContext<UserContextType>({
	userData: defaultUserData,
	updateUserData: () => {
		throw new Error('updateUSerGata function must be overriden');
	},
	resetUserData: () => {
		throw new Error('setUserData function must be overridden');
	},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	// State of the context
	// We use our initial state aboe to initialize it
	const [userData, setUserData] = useState<UserData>(defaultUserData);

	// TODO: remove this and corresponding logs
	// Logs the updates to userData as they happen
	// useEffect(() => {
	// 	logUserData(`${JSON.stringify(userData, null, 4)}`);
	// }, [userData]);

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateUserData = (updates: Partial<UserData>) => {
		setUserData((prevUserData: UserData) => ({
			...prevUserData,
			...updates,
		}));
	};

	// Helper function to reset the user data state to its initial state in one function call
	const resetUserData = () => {
		logUserData('reset the userData context');
		setUserData(defaultUserData);
	};

	const logUserData = (content: string) => {
		console.log(
			`%c UserDataUpdated %c ${content}`,
			'background: yellow; color:red',
			'',
		);
	};

	return (
		<UserContext.Provider value={{ userData, updateUserData, resetUserData }}>
			{children}
		</UserContext.Provider>
	);
};
