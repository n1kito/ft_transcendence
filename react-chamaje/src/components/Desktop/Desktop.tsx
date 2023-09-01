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
import Leaderboard from '../Leaderboard/Leaderboard';
import Channels from '../Channels/Channels';

import ProfileIcon from './Icons/CARD.svg';
import ChatIcon from './Icons/PC.svg';
import FriendsIcon from './Icons/NOTEBOOK.svg';
import GameIcon from './Icons/CD.svg';
import LeaderboardIcon from './Icons/PLANET.svg';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setFriendsWindowIsOpen] = useState(false);
	const [openProfileWindow, setProfileWindowIsOpen] = useState(false);
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [channelsWindowIsOpen, setChannelsWindowIsOpen] = useState(false);
	const [leaderboardWindowIsOpen, setLeaderboardWindowIsOpen] = useState(true);

	const navigate = useNavigate();
	const { isAuthentificated, refreshToken, logOut, accessToken } = useAuth();
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
				const response = await fetch('/api/user/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					// Set the user data in the context
					setUserData(data);
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
		setFriendsWindowIsOpen(true);
		navigate('/friends');
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
				onDoubleClick={() => setProfileWindowIsOpen}
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
			<DesktopIcon
				name="Board"
				iconSrc={LeaderboardIcon}
				id={++iconId}
				onDoubleClick={() => setLeaderboardWindowIsOpen(true)}
			/>
			<AnimatePresence>
				{openProfileWindow && (
					<Profile
						login="mjallada"
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
				{/* <ChatWindow login="Jee" /> */}
				{leaderboardWindowIsOpen && (
					<Leaderboard
						onCloseClick={() => setLeaderboardWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Desktop;
