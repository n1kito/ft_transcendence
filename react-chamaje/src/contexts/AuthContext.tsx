import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

interface IAuthContext {
	isAuthentificated: boolean;
	logOut: () => void; // function that will log out the user
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
					console.log('User is authentificated = ' + data.isAuthentificated);
				} else {
					setIsAuthentificated(false);
					console.log('NestJs request failed to auth-check');
				}
			} catch (error) {
				console.log('Error occured while checking authentification:', error);
			}
		};

		checkAuth();
	}, []);

	const logOut = () => {
		Cookies.remove('token');
		setIsAuthentificated(false);
	};

	return (
		<AuthContext.Provider value={{ isAuthentificated, logOut }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
