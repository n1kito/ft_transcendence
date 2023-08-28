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
import Button from './../Shared/Button/Button';
import { unmountComponentAtNode, render } from 'react-dom';
import { createRoot } from 'react-dom/client';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const { isAuthentificated, refreshToken, logOut, accessToken } = useAuth();

	useEffect(() => {
		// if (!isAuthentificated) return;
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
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
					const mySocket = new WebSocketService(accessToken, data.login);
					const updatedData = {
						...data,
						chatSocket: mySocket,
					};
					// Set the user data in the context
					setUserData(updatedData);
				} else {
					logOut();
				}
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		if (isAuthentificated) fetchUserData();
		return () => {
			userData?.chatSocket?.endConnection(userData.login);
			console.log('ending connection in desktop');
			// when unmounting desktop component, reset userData
			setUserData(null);
			// alert(userData?.login || 'no login');
			// socket.emit('endedConnection', data.login);
			// socket.disconnect();
			// prompt();
		};
	}, []);

	useEffect(() => {
		window.addEventListener('unload', handleTabClosing)
		return () => {
			window.removeEventListener('unload', handleTabClosing)
		}
	})
	
	const handleTabClosing = () => {
		userData?.chatSocket?.endConnection(userData.login);
		logOut();
		setUserData(null);
	}

	const friendsClickHandler = () => {
		setOpenedFriendsWindows(true);
		navigate('/friends');
	};

	const handleClick = () => {
		logOut();
		userData?.chatSocket?.endConnection(userData.login);
		// alert(userData?.login || 'no login');
	};

	return (
		<div id="desktop">
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
					<Button baseColor={[308, 80, 92]} onClick={handleClick}>
						add friend
					</Button>
					{/* <Profile login={userData ? userData.login : 'random'} /> */}
					{/* <Profile login='randomLg'/> */}
				</Window>
			</div>
		</div>
	);
};

export default Desktop;
