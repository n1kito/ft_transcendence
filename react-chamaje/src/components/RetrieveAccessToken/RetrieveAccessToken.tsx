import React, { useContext, useEffect } from 'react';
import './RetrieveAccessToken.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
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
			console.log('CODE: ', code);
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
						// if 2fa is enabled redirect back to login page
						console.log('2fa status: ', data.twofa);
						if (!data.twofa) navigate('/desktop');
						// Redirect user to desktop
						else {
							setIsTwoFAEnabled(true);
							navigate('/');
						}
					}
				} catch (error) {
					console.error('Error fetching access token: ', error);
					//TODO: make an actual error page OR better make the login terminal display an error message
					navigate('/error');
				}
			}
		}
		fetchAccessToken();
	}, [navigate, location.search]);
	return <div>trying to get access token...</div>;
};

export default RetrieveAccessToken;
