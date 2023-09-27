import React, { useContext, useEffect, useRef, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import Profile from '../Profile/Profile';
import PrivateMessages from '../PrivateMessages/PrivateMessages';
import { AnimatePresence } from 'framer-motion';
import Channels from '../Channels/Channels';

import ProfileIcon from './Icons/CARD.svg';
import ChatIcon from './Icons/PC.svg';
import FriendsIcon from './Icons/NOTEBOOK.svg';
import GameIcon from './Icons/CD.svg';
import ChannelsIcon from './Icons/EARTH.svg';
import Game from '../Game/Game';
import { GameProvider } from '../../contexts/GameContext';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, updateUserData } = useContext(UserContext);
	const [friendsWindowIsOpen, setFriendsWindowIsOpen] = useState(false);
	const [profileWindowIsOpen, setProfileWindowIsOpen] = useState(false);
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [channelsWindowIsOpen, setChannelsWindowIsOpen] = useState(false);
	const [gameWindowIsOpen, setGameWindowIsOpen] = useState(false);

	// const navigate = useNavigate();
	const { isAuthentificated, logOut, accessToken } = useAuth();
	const windowDragConstraintRef = useRef(null);

	// if (isAuthentificated) {
	// 	console.log('user is authentificated');
	// } else console.log('user is not authentificated');
	useEffect(() => {
		// fetch request
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				// user/me
				const response = await fetch(`/api/user/${'me'}`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					// Set the user data in the context
					updateUserData(data);
				} else {
					console.error('Could not fetch user data');
					logOut();
				}
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		if (isAuthentificated) fetchUserData();
	}, [isAuthentificated]);

	// const friendsClickHandler = () => {
	// 	setFriendsWindowIsOpen(true);
	// 	navigate('/friends');
	// };

	return (
		<div className="desktopWrapper" ref={windowDragConstraintRef}>
			<DesktopIcon
				name="Game"
				iconSrc={GameIcon}
				id={++iconId}
				onDoubleClick={() => setGameWindowIsOpen(true)}
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
				iconSrc={ChannelsIcon}
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
				{profileWindowIsOpen && (
					<Profile
						login="mjallada"
						onCloseClick={() => setProfileWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						key="profile-window"
					/>
				)}
				{chatWindowIsOpen && (
					<PrivateMessages
						onCloseClick={() => setChatWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						key="private-messages-window"
					/>
				)}
				{channelsWindowIsOpen && (
					<Channels
						onCloseClick={() => setChannelsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						key="channels-window"
					/>
				)}
				{gameWindowIsOpen && (
					<Game
						// opponentLogin={
						// 	userData.login == 'mjallada'
						// 		? 'freexav'
						// 		: userData.login == 'jeepark'
						// 		? 'cgosseli'
						// 		: ''
						// }
						onCloseClick={() => setGameWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						key="game-window"
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Desktop;
