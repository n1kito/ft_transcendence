import React, { createContext, useEffect, useState } from 'react';
import { IUserData } from '../../../shared-lib/types/user';

// Default content for an empty userdata object
const defaultUserData: IUserData = {
	// User informatiom
	id: 0,
	login: '',
	image: '',
	// Profile information
	gamesCount: 0,
	// Target
	targetDiscoveredByUser: false,
};

interface UserContextType {
	userData: IUserData;
	updateUserData: (updates: Partial<IUserData>) => void;
	resetUserData: () => void;
}

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
	const [userData, setUserData] = useState<IUserData>(defaultUserData);

	// Logs the updates to userData as they happen
	useEffect(() => {
		// logUserData(`${JSON.stringify(userData, null, 4)}`);
	}, [userData]);

	// We want a helper function that will allow us to update one, many or all
	// properties of the game state without having to override the entire thing manually
	const updateUserData = (updates: Partial<IUserData>) => {
		setUserData((prevUserData: IUserData) => ({
			...prevUserData,
			...updates,
		}));
	};

	// Helper function to reset the user data state to its initial state in one function call
	const resetUserData = () => {
		// logUserData('reset the userData context');
		setUserData(defaultUserData);
	};

	// const logUserData = (content: string) => {
	// 	console.log(
	// 		`%c UserDataUpdated %c ${content}`,
	// 		'background: yellow; color:red',
	// 		'',
	// 	);
	// };

	return (
		<UserContext.Provider value={{ userData, updateUserData, resetUserData }}>
			{children}
		</UserContext.Provider>
	);
};
