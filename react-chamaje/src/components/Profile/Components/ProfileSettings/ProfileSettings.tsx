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
	const [emailError, SetEmailError] = useState<string | null>(null);

	useEffect(() => {
		if (userData) {
			setUsername(userData.login);
			setEmail(userData.email);
		}
	}, [userData]);

	// Handle username state when it is changed in the inputfield
	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);

		const allowedCharactersRegex = /^[A-Za-z0-9-_\.]*$/;

		if (!newUsername) setUsernameError('Username cannot be empty');
		else if (newUsername.length > 8)
			setUsernameError('Username must not exceed 8 characters');
		else if (newUsername.length < 4)
			setUsernameError('Username must be at least 4 characters');
		else if (!allowedCharactersRegex.test(newUsername))
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

		if (!newEmail) SetEmailError('Email cannot be empty');
		else if (!emailRegex.test(newEmail))
			SetEmailError('Email format is invalid');
		else SetEmailError(null);
	};

	const handleSaveButtonClick = async () => {
		// send a request to update username and/or email on the server
		if (usernameError || emailError) {
			alert('Invalid username or email');
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/user/me/update', {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ login: username, email: email }),
			});

			if (response.ok) {
				// Update the userData in the context with the updated user data
				const updatedUserData = {
					...userData,
					login: username,
					email: email,
					image: userData?.image || '',
				};
				setUserData(updatedUserData);
				// alert('User data updated successfully!');
			} else {
				// alert('Failed to update user data. Please try again.');
				setUsernameError('username already exists');
				console.log('Failed to update ');
			}
		} catch (error) {
			console.error('Error updating user data:', error);
			alert('An error occrred while updating user data. Please try again');
		}
	};

	return (
		<ShadowWrapper shadow={true} backgroundColor="#D5B1F9">
			<div className="ProfileForm">
				<Title highlightColor="#F8EF57">My Profile</Title>
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
					onClick={handleSaveButtonClick}
					disabled={!!usernameError || !!emailError}
					baseColor={[57, 92, 66]}
				>
					save
				</Button>
			</div>
		</ShadowWrapper>
	);
};

export default ProfileSettings;
