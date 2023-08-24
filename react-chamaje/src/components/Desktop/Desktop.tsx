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
import WebSocketService from 'src/services/WebSocketService';
import  Button from './../Shared/Button/Button'
import { unmountComponentAtNode, render } from "react-dom";
import { createRoot } from 'react-dom/client';

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
					const mySocket = new WebSocketService(data.login);
					const updatedData = {
						...data,
						chatSocket: mySocket,
					};
					setUserData(updatedData);

					// const socket = io({ path: '/ws/' });

					// On connection, sends to the server a 'connectionToServer'
					// message with its login so the server tells everyone a new
					// user just connected
					// socket.on('connect', () => {
					// 	console.log('\nConnected to server ! 🔌🟢\n ');
					// 	socket.emit('connectionToServer', data.login);
					// });

					// socket.on('startedConnection', (data) => {
					// 	console.log(data);
					// })

					// socket.on('message', (data) => {
					// 	console.log('Response from server: ', data);
					// });

					return () => {
						userData?.chatSocket?.endConnection(data.login);
						console.log('ending connection in desktop');
						// socket.emit('endedConnection', data.login);
						// socket.disconnect();
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

    const handleClick = () => {
		logOut();
		userData?.chatSocket?.endConnection(userData.login);
	}

	return (
		<div id= "desktop">
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
				<Button baseColor={[308, 80, 92]} onClick={handleClick}>add friend</Button>
				{/* <Profile login={userData ? userData.login : 'random'} /> */}
				{/* <Profile login='randomLg'/> */}
			</Window>
		</div>
		</div>

	);
};

export default Desktop;
