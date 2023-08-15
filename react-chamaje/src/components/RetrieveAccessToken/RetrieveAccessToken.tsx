import React, { useContext, useEffect } from 'react';
import './RetrieveAccessToken.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import useAuth from '../../hooks/userAuth';

const RetrieveAccessToken = () => {
	const { updateAccessToken } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		async function fetchAccessToken() {
			// Retrieve the code from the current URL
			const urlParameters = new URLSearchParams(location.search);
			console.log({ urlParameters });
			const code = urlParameters.get('code');
			console.log({ code });
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
						console.log('Successfully retrieved access token');
						// Store token in AuthContext
						updateAccessToken(data.accessToken);
						// Redirect user to desktop
						navigate('/desktop');
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
