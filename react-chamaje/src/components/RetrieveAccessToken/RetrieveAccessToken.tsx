import React, { useEffect } from 'react';
import './RetrieveAccessToken.css';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/userAuth';

const RetrieveAccessToken = () => {
	const { updateAccessToken, isTwoFAEnabled, setIsTwoFAEnabled } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		async function fetchAccessToken() {
			// Retrieve the code from the current URL
			const urlParameters = new URLSearchParams(location.search);
			const code = urlParameters.get('code');
			if (code) {
				try {
					const response = await fetch('/api/login/retrieve-access-token', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						credentials: 'include',
						body: JSON.stringify({ code }),
					});
					const data = await response.json();
					if (data.accessToken) {
						// Store token in AuthContext
						updateAccessToken(data.accessToken);

						// Redirect user back to login page to continue login process with google authenticator
						if (data.twofa) {
							setIsTwoFAEnabled(true);
							navigate('/');
						}
						// else redirect to desktop page
						else navigate('/desktop');
					}
				} catch (error) {
					navigate('/error');
				}
			}
		}
		fetchAccessToken();
	}, [navigate, location.search]);
	return <div>trying to get access token...</div>;
};

export default RetrieveAccessToken;
