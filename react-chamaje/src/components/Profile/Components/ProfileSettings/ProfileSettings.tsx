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

	useEffect(() => {
		if (userData) {
			setUsername(userData.login);
			setEmail(userData.email);
		}
	}, [userData]);

	// Handle username state when it is changed in the inputfield
	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);
	};

	// Handle email state when it is changed in the inputfield
	const handleEmailChange = (newEmail: string) => {
		setEmail(newEmail);
	};

	const handleSaveButtonClick = () => {
		// send a request to update username and/or email on the server
		// create update endpoint
		// setUserData();
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
				<InputField value={username} onChange={handleUsernameChange} />
				<InputField value={email} onChange={handleEmailChange} />
				<Button buttonText="Save"></Button>
			</div>
		</ShadowWrapper>
	);
};

export default ProfileSettings;
