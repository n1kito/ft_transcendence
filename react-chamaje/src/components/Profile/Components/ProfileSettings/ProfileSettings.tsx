import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import Button from '../../../Shared/Button/Button';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../InputField/InputField';
import Title from '../Title/Title';
import './ProfileSettings.css';

const ProfileSettings: React.FC = () => {
	const { userData, setUserData } = useContext(UserContext);
	let login = userData ? userData.login : 'MyLogin';

	console.log('profile settings' + login);

	console.log({ userData });

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');

	useEffect(() => {
		if (userData) {
			setUsername(userData.login);
			setEmail(userData.email);
		}
	}, [userData]);

	const handleUsernameChange = (newUsername: string) => {
		setUsername(newUsername);
	};

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
