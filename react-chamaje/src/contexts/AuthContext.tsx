import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface IAuthContext {
	isAuthentificated: boolean;
	logOut: () => void; // function that will log out the user
	refreshToken: () => Promise<void>;
}

export const AuthContext = React.createContext<IAuthContext | undefined>(
	undefined,
);

interface AuthProviderProps {
	children: React.ReactNode;
}

const AuthContextProvider: React.FC<AuthProviderProps> = ({
	children,
}: AuthProviderProps) => {
	const [isAuthentificated, setIsAuthentificated] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('http://localhost:3000/auth-check', {
					method: 'GET',
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					setIsAuthentificated(data.isAuthentificated);
				} else {
					setIsAuthentificated(false);
				}
			} catch (error) {
				console.log('Error occured while checking authentification:', error);
			}
		};
		checkAuth();
	}, []);

	const logOut = () => {
		Cookies.remove('accessToken');
		Cookies.remove('refreshToken');

		setIsAuthentificated(false);
	};

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
				// Assuming the response contains a new access token
				const data = await response.json();
				const newAccessToken = data.accessToken;
				console.log('--- AUTH CONTEXT ---');
				console.log('new access token: ', newAccessToken);
				// Update the state with the new access token and set isAuthenticated to true
				setIsAuthentificated(true);
				return;
			} else {
				// If the refresh token is invalid or expired, log the user out
				logOut();
			}
		} catch (error) {
			console.log('Error occurred while refreshing token:', error);
		}
	};

	return (
		<AuthContext.Provider value={{ isAuthentificated, logOut, refreshToken }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
