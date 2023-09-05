import React, { useContext, useEffect, useRef, useState } from 'react';
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
import PrivateMessages from '../PrivateMessages/PrivateMessages';
import { AnimatePresence } from 'framer-motion';
import ChatWindow from '../ChatWindow/ChatWindow';

import ProfileIcon from './Icons/CARD.svg';
import ChatIcon from './Icons/PC.svg';
import FriendsIcon from './Icons/NOTEBOOK.svg';
import GameIcon from './Icons/CD.svg';
import Channels from '../Channels/Channels';
import { io } from 'socket.io-client';
import WebSocketService from 'src/services/WebSocketService';
import Button from './../Shared/Button/Button';
import { unmountComponentAtNode, render } from 'react-dom';
import { createRoot } from 'react-dom/client';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setFriendsWindowIsOpen] = useState(false);
	const [openProfileWindow, setProfileWindowIsOpen] = useState(false);
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [channelsWindowIsOpen, setChannelsWindowIsOpen] = useState(false);

	const navigate = useNavigate();
	const {
		isAuthentificated,
		setIsAuthentificated,
		refreshToken,
		logOut,
		accessToken,
		setIsTwoFAEnabled,
		isTwoFAEnabled,
		TwoFAVerified,
		setTwoFAVerified,
	} = useAuth();

	let [qrcode, setQrcode] = useState('');
	const windowDragConstraintRef = useRef(null);

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
					const mySocket = new WebSocketService(accessToken, data.id);
					const updatedData = {
						...data,
						chatSocket: mySocket,
					};
					// Set the user data in the context
					setUserData(updatedData);
					setIsTwoFAEnabled(data.isTwoFaEnabled);
				} else {
					logOut();
				}
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		if (isAuthentificated) fetchUserData();
		return () => {
			// alert();
			userData?.chatSocket?.endConnection();
			// when unmounting desktop component, reset userData
			setUserData(null);
			setIsTwoFAEnabled(false);
			setIsAuthentificated(false);
			setIsTwoFAEnabled(false);
		};
	}, []);

	useEffect(() => {
		window.addEventListener('unload', handleTabClosing);
		return () => {
			window.removeEventListener('unload', handleTabClosing);
		};
	});

	const handleTabClosing = () => {
		userData?.chatSocket?.endConnection();
		logOut();
		setUserData(null);
	};

	const friendsClickHandler = () => {
		setFriendsWindowIsOpen(true);
		navigate('/friends');
	};

	// TEST BUTTON FOR ENABLING TWO FACTOR AUTHENTICATION
	const handleClick = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-on', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				console.log(response);
				const data = await response.text();
				console.log('qr code: ', data);
				setQrcode(data);
				setIsTwoFAEnabled(true);
				setTwoFAVerified(false);
				// logOut();
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};
	useEffect(() => {}, [qrcode]);

	useEffect(() => {
		console.log('\n\n Desktop: is two fa enabled ?', isTwoFAEnabled);
	}, [isTwoFAEnabled]);

	const handleClickDisable = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-off', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				console.log('is oke');
				setQrcode('');
				setIsTwoFAEnabled(false);
				setTwoFAVerified(false);
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};

	return (
		<div className="desktopWrapper" ref={windowDragConstraintRef}>
			<DesktopIcon
				name="Game"
				iconSrc={GameIcon}
				id={++iconId}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Profile"
				iconSrc={ProfileIcon}
				id={++iconId}
				onDoubleClick={() => setProfileWindowIsOpen(true)}
			/>
			<DesktopIcon
				name="Chat"
				iconSrc={ChatIcon}
				id={++iconId}
				onDoubleClick={() => setChatWindowIsOpen(true)}
			/>
			<DesktopIcon
				name="Channels"
				iconSrc={ChatIcon}
				id={++iconId}
				onDoubleClick={() => setChannelsWindowIsOpen(true)}
			/>
			<DesktopIcon
				name="Friends"
				iconSrc={FriendsIcon}
				id={++iconId}
				onDoubleClick={() => setFriendsWindowIsOpen(true)}
			/>
			<AnimatePresence>
				{openProfileWindow && (
					<Profile
						login="jeepark"
						onCloseClick={() => setProfileWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
				{chatWindowIsOpen && (
					<PrivateMessages
						onCloseClick={() => setChatWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
				{channelsWindowIsOpen && (
					<Channels
						onCloseClick={() => setChannelsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
				<ChatWindow login="Jee" />
				<Profile
					login="jeepark"
					onCloseClick={() => setProfileWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
				/>
			</AnimatePresence>
		</div>
	);
};

export default Desktop;
