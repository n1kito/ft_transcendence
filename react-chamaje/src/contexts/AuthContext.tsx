import React, { useEffect, useState } from 'react';

interface IAuthContext {
	isAuthentificated: boolean;
	setIsAuthentificated: (status: boolean) => void;
	isTwoFAEnabled: boolean;
	setIsTwoFAEnabled: (status: boolean) => void;
	logOut: () => void; // function that will log out the user
	refreshToken: () => Promise<void>;
	updateAccessToken: (generatedAccessToken: string) => void;
	accessToken: string;
	setAccessToken: (token: string) => void;
	isTwoFaVerified: boolean;
	setIsTwoFaVerified: (status: boolean) => void;
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
	const [isTwoFAEnabled, setIsTwoFAEnabled] = useState(false);
	const [isTwoFaVerified, setIsTwoFaVerified] = useState(false);
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
				const data = await response.json();

				// If authenticated, update state accordingly
				if (response.ok) {
					setIsAuthentificated(data.isAuthentificated);
				} else if (response.status === 401) {
					try {
						// Attempt to refresh the token if it's invalid or expired
						refreshToken();
					} catch (error) {
						// Log the user out if token refresh fails
						logOut();
					}
				}
			} catch (error) {
				// Log the user out if fetching authentication status fails
				logOut();
			}
		};
		checkAuth();
	}, []);

	// Log the user out by removing cookies and updating state
	const logOut = async () => {
		try {
			await fetch('/api/login/logout', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				credentials: 'include',
			});
		} catch (error) {
			return;
		}
		setAccessToken('');
		setIsAuthentificated(false);
		setIsTwoFaVerified(false);
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
					setIsAuthentificated(true);

					setIsTwoFAEnabled(data.isTwoFactorAuthEnabled);
					setIsTwoFaVerified(data.isTwoFactorAuthVerified);
				}
			}
			// } else {
			// 	logOut();
			// }
		} catch (error) {
			// Log the user out if token refresh fails
			logOut();
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
				setIsAuthentificated,
				isTwoFAEnabled,
				setIsTwoFAEnabled,
				logOut,
				refreshToken,
				updateAccessToken,
				accessToken,
				setAccessToken,
				isTwoFaVerified,
				setIsTwoFaVerified,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
