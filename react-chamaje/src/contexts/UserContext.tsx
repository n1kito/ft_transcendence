import React, {
	Dispatch,
	SetStateAction,
	createContext,
	useState,
} from 'react';

interface UserData {
	// Define the structure of your user data
	// For example:
	image: string;
	login: string;
	email: string;
	killCount?: number;
	// TODO: the killcount was set as optional here to remove a compiling error with ProfileSettings.tsx but need to check it's ok
	// same for the other properties below
	winRate?: number;
	gamesCount?: number;
	bestFriendLogin?: string;
	rank?: number;
	// ... other properties
}

interface UserContextType {
	userData: UserData | null;
	setUserData: Dispatch<SetStateAction<UserData | null>>;
}

// TODO: should we setup a custom type here ?
export const UserContext = createContext<UserContextType>({
	userData: null,
	setUserData: () => {
		throw new Error('setUserData function must be overridden');
	},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const [userData, setUserData] = useState<UserData | null>(null);

	return (
		<UserContext.Provider value={{ userData, setUserData }}>
			{children}
		</UserContext.Provider>
	);
};
