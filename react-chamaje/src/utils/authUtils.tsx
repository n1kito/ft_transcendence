import React, { FunctionComponent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/userAuth';

// This will redirect the user to "/desktop" if the user is authentificated, or and if not show the component passed as parameter
export function showComponentIfNotLoggedIn<P extends object>(
	Component: FunctionComponent<P>,
) {
	const WrappedComponent: React.FC<P> = (props) => {
		const navigate = useNavigate();
		const { isAuthentificated, isTwoFAEnabled, isTwoFaVerified } = useAuth();

		useEffect(() => {
			// if authenticate and 2FA was disabled or
			// if authenticate and 2FA was enabled and code was verified
			// go to desktop

			if (
				(isAuthentificated && !isTwoFAEnabled) ||
				(isAuthentificated && isTwoFAEnabled && isTwoFaVerified)
			) {
				navigate('/desktop');
			}
		}, [isAuthentificated, navigate, isTwoFAEnabled]);
		return <Component {...props} />;
	};

	// Gives the component a name, for debugging purposes
	WrappedComponent.displayName = `showComponentIfNotLoggedIn(${
		Component.displayName || Component.name || 'Component'
	})`;

	return WrappedComponent;
}

// This will redirect the user to '/' if the user is not authentificated, and show the component passed as parameter if they are
export function showComponentIfLoggedIn<P extends object>(
	Component: FunctionComponent<P>,
) {
	const WrappedComponent: React.FC<P> = (props) => {
		const navigate = useNavigate();
		const { isAuthentificated } = useAuth(); // use your context state

		useEffect(() => {
			if (!isAuthentificated) {
				navigate('/');
			}
		}, [isAuthentificated, navigate]);

		return <Component {...props} />;
	};

	// Gives the component a name, for debugging purposes
	WrappedComponent.displayName = `showComponentIfLoggedIn(${
		Component.displayName || Component.name || 'Component'
	})`;

	return WrappedComponent;
}
