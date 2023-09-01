import React, { useEffect, FunctionComponent } from 'react';
import useAuth from '../hooks/userAuth';
import { useNavigate } from 'react-router-dom';

// This will redirect the user to "/desktop" if the user is authentificated, or and if not show the component passed as parameter
export function showComponentIfNotLoggedIn<P extends object>(
	Component: FunctionComponent<P>,
) {
	const WrappedComponent: React.FC<P> = (props) => {
		const navigate = useNavigate();
		const { isAuthentificated, isTwoFAEnabled, TwoFAVerified } = useAuth();

		useEffect(() => {
			// if authenticate and 2FA was disabled or
			// if authenticate and 2FA was enabled and code was verified
			// go to desktop
			console.log('\n\n🍄 User is authenticated: ', isAuthentificated);
			console.log('🍄 2FA has been enabled: ', isTwoFAEnabled)
			console.log('🍄 2FA has been verified: ', TwoFAVerified);
			if (
				(isAuthentificated && !isTwoFAEnabled) ||
				(isAuthentificated && isTwoFAEnabled && TwoFAVerified)
			) {
				navigate('/desktop');
			}
		}, [isAuthentificated, navigate, isTwoFAEnabled, TwoFAVerified]);
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
