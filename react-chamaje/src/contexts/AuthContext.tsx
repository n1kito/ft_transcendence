import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface IAuthContext {
	isAuthentificated: boolean;
	logOut: () => void; // function that will log out the user
	refreshToken: () => Promise<void>;
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
	// Effect to check authentication status when component mounts
	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Fetch the authentication status from the server
				const response = await fetch('http://localhost:3000/auth-check', {
					method: 'GET',
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
		Cookies.remove('accessToken');
		Cookies.remove('refreshToken');
		setIsAuthentificated(false);
	};

	// Function to refresh the token by making a request to the server
	const refreshToken = async () => {
		try {
			const response = await fetch(
				'http://localhost:3000/token/refresh-token',
				{
					method: 'POST',
					credentials: 'include',
				},
			);

			if (response.ok) {
				// Update authentication status if token refresh is successful
				setIsAuthentificated(true);
			}
		} catch (error) {
			// Log the user out if token refresh fails
			logOut();
			console.log('Error occurred while refreshing token:', error);
		}
	};

	// Provide the authentication context to children components
	return (
		<AuthContext.Provider value={{ isAuthentificated, logOut, refreshToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
