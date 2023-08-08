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
					try {
						refreshToken();
					} catch (error) {
						console.log('error:', error);
						logOut();
					}
					logOut();
				}
			} catch (error) {
				logOut();
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
				setIsAuthentificated(true);
			}
		} catch (error) {
			logOut();

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
