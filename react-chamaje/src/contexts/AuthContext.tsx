import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface IAuthContext {
	isAuthentificated: boolean;
	logOut: () => void; // function that will log out the user
	refreshToken: () => Promise<void>;
	updateAccessToken: (generatedAccessToken: string) => void;
	accessToken: string;
}

// Create the AuthContext using React's createContext
export const AuthContext = React.createContext<IAuthContext | undefined>(
	undefined,
);

// Define the props for the AuthProvider
interface AuthProviderProps {
	children: React.ReactNode;
}

// AuthContextProvider component that manages authentication state
const AuthContextProvider: React.FC<AuthProviderProps> = ({
	children,
}: AuthProviderProps) => {
	const [isAuthentificated, setIsAuthentificated] = useState(false);
	const [accessToken, setAccessToken] = useState('');

	// Effect to check authentication status when component mounts
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Fetch the authentication status from the server
				const response = await fetch('/api/auth-check', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
					credentials: 'include',
				});
				// If authenticated, update state accordingly
				if (response.ok) {
					const data = await response.json();
					setIsAuthentificated(data.isAuthentificated);
				} else if (response.status === 401) {
					try {
						// Attempt to refresh the token if it's invalid or expired
						refreshToken();
					} catch (error) {
						// Log the user out if token refresh fails
						logOut();
					}
					// Log the user out in case of other authentication errors
					logOut();
				}
			} catch (error) {
				// Log the user out if fetching authentication status fails
				logOut();
			}
		};
		checkAuth();
	}, []);

	// Log the user out by removing cookies and updating state
	const logOut = () => {
		Cookies.remove('refreshToken');
		setIsAuthentificated(false);
	};

	// Function to refresh the token by making a request to the server
	const refreshToken = async () => {
		try {
			const response = await fetch('/api/token/refresh-token', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				credentials: 'include',
			});
			if (response.ok) {
				const data = await response.json();
				if (data.accessToken) {
					updateAccessToken(data.accessToken);
					// Update authentication status if token refresh is successful
					setIsAuthentificated(true);
				}
			} else {
				console.log('Refresh response is NOT ok');
			}
		} catch (error) {
			console.log('Refresh token failed, logging out');
			// Log the user out if token refresh fails
			logOut();
			console.log('Error occurred while refreshing token:', error);
		}
	};

	// if access token is found store it in access token state
	const updateAccessToken = (generatedAccessToken: string) => {
		setAccessToken(generatedAccessToken);
	};

	// Provide the authentication context to children components
	return (
		<AuthContext.Provider
			value={{
				isAuthentificated,
				logOut,
				refreshToken,
				updateAccessToken,
				accessToken,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
