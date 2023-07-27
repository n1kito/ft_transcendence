import React, { useContext, useEffect, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import cupcakeIcon from './Components/DesktopIcon/images/CUPCAKE.svg';
import Window from '../Window/Window';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import InputField from '../Profile/Components/InputField/InputField';
import ProfileSettings from '../Profile/Components/ProfileSettings/ProfileSettings';
import LoginForm from '../NotUsed/LoginForm/LoginForm';
import Title from '../Profile/Components/Title/Title';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const { isAuthentificated } = useAuth();

	if (isAuthentificated) {
		console.log('user is authentificated');
		console.log('user login is ' + userData?.login);
	} else console.log('user is not authentificated');
	useEffect(() => {
		// fetch request
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				console.log('trying to fetch');
				// user/me
				const response = await fetch('http://localhost:3000/user/jeepark', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();
				console.log(data);
				// Set the user data in the context
				setUserData(data);
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		fetchUserData();
	}, [setUserData]);

	const friendsClickHandler = () => {
		setOpenedFriendsWindows(true);
		navigate('/friends');
	};

	// const location = useLocation();
	// const searchParams = new URLSearchParams(location.search);
	// const parameterValue = searchParams.get('login');

	// setUserData({
	// 	login: parameterValue || ''
	// });

	return (
		<div className="desktopWrapper">
			<DesktopIcon
				name="Game"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Friends"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Chat"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			{/* {openFriendsWindow && <Window windowTitle="Friends"><FriendsList /></Window>}*/}
			<Window
				windowTitle="Friends"
				links={[
					{ name: 'Add friend', url: '#' },
					{ name: 'See online friends', url: '#' },
					{ name: 'Do something', url: '#' },
				]}
			>
				{/* <FriendsList /> */}
				<ProfileSettings />
			</Window>
		</div>
	);
};

export default Desktop;
