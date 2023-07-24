import React, { useState } from 'react';
import Button from '../../../Shared/Button/Button';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../InputField/InputField';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
	const [username, setUsername] = useState('cgosseli');
	const [email, setEmail] = useState('cgosseli@student.42.fr');

	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);
	};

	const handleEmailChange = (newEmail: string) => {
		setEmail(newEmail);
	};

	return (
		<ShadowWrapper>
			<div className="ProfileForm">
				<InputField value={username} onChange={handleUsernameChange} />
				<InputField value={email} onChange={handleEmailChange} />
				<Button buttonText="Save"></Button>
			</div>
		</ShadowWrapper>
	);
};

export default ProfileSettings;
