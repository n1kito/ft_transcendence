import React, { useContext, useEffect, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import cupcakeIcon from './Components/DesktopIcon/images/CUPCAKE.svg';
import Window from '../Window/Window';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import ProfileSettings from '../Profile/Components/ProfileSettings/ProfileSettings';
import { AuthContext } from '../../contexts/AuthContext';
import Profile from '../Profile/Profile';
import { io } from 'socket.io-client';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const { isAuthentificated, refreshToken, logOut, accessToken } = useAuth();

	if (isAuthentificated) {
		console.log('user is authentificated');
	} else console.log('user is not authentificated');
	useEffect(() => {
		// fetch request
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				// user/me
				const response = await fetch('/api/user/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					// Set the user data in the context
					setUserData(data);
					const socket = io({ path: '/ws/' });
					socket.on('connect', () => {
						console.log('\nConnected to server ! 🔌🟢\n ');
						socket.emit('startedConnection', data.login);
					});
					
					// socket.on('startedConnection', (data) => {
					// 	console.log(data);
					// })

					socket.on('message', (data) => {
						console.log('Response from server: ', data);
					});

					return () => {
						socket.emit('endedConnection', data.login)
						socket.disconnect();
					};
				} else {
					logOut();
				}
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

	return (
		<div className="desktopWrapper">
			<DesktopIcon
				name="Game"
				iconSrc={cupcakeIcon}
				id={++iconId}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Friends"
				iconSrc={cupcakeIcon}
				id={++iconId}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Chat"
				iconSrc={cupcakeIcon}
				id={++iconId}
				onDoubleClick={friendsClickHandler}
			/>
			<Window
				windowTitle={userData?.login || 'window title'}
				links={[
					{ name: 'Link1', url: '#' },
					{ name: 'Link2', url: '#' },
					{ name: 'Link3', url: '#' },
				]}
				useBeigeBackground={true}
			>
				<FriendsList />
				{/* <Profile login={userData ? userData.login : 'random'} /> */}
				{/* <Profile login='randomLg'/> */}
			</Window>
		</div>
	);
};

export default Desktop;
