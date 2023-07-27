import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import Button from '../../../Shared/Button/Button';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../InputField/InputField';
import Title from '../Title/Title';
import './ProfileSettings.css';

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

		if (!newUsername || newUsername.length > 8) {
			setUsernameError('Username cannot be empty');
		} else {
			setUsernameError(null);
		}
	};

	// Handle email state when it is changed in the inputfield
	const handleEmailChange = (newEmail: string) => {
		setEmail(newEmail);
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
				<InputField value={email} onChange={handleEmailChange} />
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
