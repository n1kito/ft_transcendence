import React, { useContext, useEffect, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import cupcakeIcon from './Components/DesktopIcon/images/CUPCAKE.svg';
import Window from '../Window/Window';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import Profile from '../Profile/Profile';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const { isAuthentificated } = useAuth();

	if (isAuthentificated) {
		console.log('user is authentificated');
	} else console.log('user is not authentificated');
	useEffect(() => {
		// fetch request
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				console.log('trying to fetch');
				// user/me
				const response = await fetch('http://localhost:3000/user/me', {
					method: 'GET',
					credentials: 'include',
				});
				const data = await response.json();
				console.log('User data', data);
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
			{/* <Window
				windowTitle="Friends"
				links={[
					{ name: 'Add friend', url: '#' },
					{ name: 'See online friends', url: '#' },
					{ name: 'Do something', url: '#' },
				]}
			>
				<FriendsList />
			</Window> */}
			<Window
				windowTitle={userData?.login || 'window title'}
				links={[
					{ name: 'Link1', url: '#' },
					{ name: 'Link2', url: '#' },
					{ name: 'Link3', url: '#' },
				]}
				useBeigeBackground={true}
			>
				<Profile />
			</Window>
		</div>
	);
};

export default Desktop;
