import { Http2ServerRequest } from 'http2';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import Button from '../../../Shared/Button/Button';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../InputField/InputField';
import Title from '../Title/Title';
import './ProfileSettings.css';

// TODO: cursor not allowed

const ProfileSettings: React.FC = () => {
	// Access userData from the UserContext
	const { userData, setUserData } = useContext(UserContext);

	// States to hold username and email values
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');

	// States to store validation errors
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);

	useEffect(() => {
		if (userData) {
			setUsername(userData.login);
			setEmail(userData.email);
		}
	}, [userData]);

	// Handle username state when it is changed in the inputfield
	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);

		const usernameRegex = /^[A-Za-z0-9-_\.]*$/;

		if (!newUsername) setUsernameError('Username cannot be empty');
		else if (newUsername.length > 8)
			setUsernameError('Username must not exceed 8 characters');
		else if (newUsername.length < 4)
			setUsernameError('Username must be at least 4 characters');
		else if (!usernameRegex.test(newUsername))
			setUsernameError(
				'Username can only contain letters, numbers, "-", "_", and "."',
			);
		else {
			setUsernameError(null);
		}
	};

	// Handle email state when it is changed in the inputfield
	const handleEmailChange = (newEmail: string) => {
		setEmail(newEmail);
		const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

		if (!newEmail) setEmailError('Email cannot be empty');
		else if (!emailRegex.test(newEmail))
			setEmailError('Email format is invalid');
		else setEmailError(null);
	};

	const handleSaveButtonClick = async () => {
		try {
			const response = await fetch('http://localhost:3000/user/me/update', {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ login: username, email: email }),
			});

			console.log('response status:', response.status);

			// Update the userData in the context with the updated user data
			if (response.ok) {
				const updatedUserData = {
					...userData,
					login: username,
					email: email,
					image: userData?.image || '',
				};
				setUserData(updatedUserData);
			} else if (response.status === 400 || response.status === 409) {
				const responseData = await response.clone().json();
				console.log('responseData: ', responseData.errors);
				// Handle validation errors
				if (responseData.errors) {
					if (responseData.errors[0].field === 'login') {
						setUsernameError(responseData.errors[0].message);
					}
					if (responseData.errors.email) {
						setEmailError(responseData.errors[0].message);
					}
				}
			}
		} catch (error: any) {
			console.error('Error updating user data:', error);
		}
	};

	return (
		<ShadowWrapper shadow={true} backgroundColor="#D5B1F9">
			<div className="ProfileForm">
				<Title
					title="My Profile"
					highlight={true}
					highlightColor="#F8EF57"
					fontSize="1.5rem"
				/>
				<InputField
					value={username}
					onChange={handleUsernameChange}
					error={usernameError}
				/>
				<InputField
					value={email}
					onChange={handleEmailChange}
					error={emailError}
				/>
				<Button
					buttonText="Save"
					onClick={handleSaveButtonClick}
					disabled={!!usernameError || !!emailError}
				/>
			</div>
		</ShadowWrapper>
	);
};

export default ProfileSettings;
