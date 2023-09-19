import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import useAuth from '../../../../hooks/userAuth';
import Button from '../../../Shared/Button/Button';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../InputField/InputField';
import Title from '../Title/Title';
import './ProfileSettings.css';

// TODO: cursor not allowed
type ValidationError = {
	property: string;
	constraints: {
		[key: string]: string;
	};
};

const ProfileSettings: React.FC = () => {
	// Access userData from the UserContext
	const { userData, setUserData } = useContext(UserContext);
	const { accessToken } = useAuth();

	// States to hold username and email values
	const [username, setUsername] = useState(userData?.login || ''); // Provide an empty string as the fallback value
	const [email, setEmail] = useState(userData?.email || ''); // Provide an empty string as the fallback value

	// States to store validation errors
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [emailError, setEmailError] = useState<string | null>(null);

	useEffect(() => {
		if (userData) {
			setUsername(userData.login || '');
			setEmail(userData.email || '');
		}
	}, [userData]);

	// Handle username state when it is changed in the inputfield
	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);

		const usernameRegex = /^[A-Za-z0-9-_\\.]*$/;

		if (!newUsername) setUsernameError('Username cannot be empty');
		else if (newUsername.length > 8)
			setUsernameError('Username must not exceed 8 characters');
		else if (newUsername.length < 4)
			setUsernameError('Username must be at least 4 characters');
		else if (!usernameRegex.test(newUsername))
			setUsernameError('Username can be letters, numbers, "-", "_", and "."');
		else {
			setUsernameError(null);
		}
		console.log(usernameError);
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
			// Check if there are any changes in the username or email
			const updatedFields: { [key: string]: string } = {};
			if (userData?.login !== username) {
				updatedFields.login = username;
			}
			if (userData?.email !== email) {
				updatedFields.email = email;
			}

			// If there are no changes, there's nothing to update
			if (Object.keys(updatedFields).length === 0) {
				console.log('No changes to update.');
				return;
			}
			const response = await fetch('/api/user/me/update', {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
				},
				body: JSON.stringify(updatedFields),
			});

			console.log('response status:', response.status);

			// Update the userData in the context with the updated user data
			if (response.ok) {
				const updatedUserData = {
					...userData,
					login: username,
					email: email,
					id: userData?.id || undefined,
					image: userData?.image || '',
					friends: userData?.friends || [],
					chatSocket: userData?.chatSocket || null,
					// winRate: userData?.winRate || 0,
					// gamesCount: userData?.gamesCount || 0,
				};
				setUserData(updatedUserData);
			}
			const responseData = await response.clone().json();
			console.log(responseData);
			if (response.status === 409 || response.status === 400) {
				responseData.errors.forEach((error: any) => {
					if (error.field === 'login') {
						setUsernameError(error.message);
					} else if (error.field === 'email') {
						setEmailError(error.message);
					}
				});
			}
		} catch (error) {
			console.error('Error updating user data:', error);
		}
	};

	return (
		<div className="profile-settings-wrapper">
			<ShadowWrapper shadow={true} backgroundColor="#D5B1F9">
				<div className="profile-form">
					<Title highlightColor="#F8EF57">My Profile</Title>
					<InputField
						value={username}
						onChange={handleUsernameChange}
						error={usernameError}
						maxlength={8}
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
		</div>
	);
};

export default ProfileSettings;
