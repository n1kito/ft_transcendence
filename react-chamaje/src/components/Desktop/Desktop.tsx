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
import { io } from 'socket.io-client';
import WebSocketService from 'src/services/WebSocketService';
import Button from './../Shared/Button/Button';
import { unmountComponentAtNode, render } from 'react-dom';
import { createRoot } from 'react-dom/client';
import PrivateMessages from '../PrivateMessages/PrivateMessages';
import { AnimatePresence } from 'framer-motion';
import ChatWindow from '../ChatWindow/ChatWindow';

import ProfileIcon from './Icons/CARD.svg';
import ChatIcon from './Icons/PC.svg';
import FriendsIcon from './Icons/NOTEBOOK.svg';
import GameIcon from './Icons/CD.svg';
import Channels from '../Channels/Channels';

// Friend structure to keep track of them and their online/ingame status
export interface IFriendStruct {
	id: number;
	login: string;
	image: string;
	onlineStatus: boolean;
}
let nbFriendsOnline = 0;

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setFriendsWindowIsOpen] = useState(false);
	const [openProfileWindow, setProfileWindowIsOpen] = useState(false);
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [privateMessageWindowIsOpen, setPrivateMessageWindowIsOpen] = useState(false);
	const [channelsWindowIsOpen, setChannelsWindowIsOpen] = useState(false);

	const navigate = useNavigate();
	const { isAuthentificated, refreshToken, logOut, accessToken } = useAuth();
	const windowDragConstraintRef = useRef(null);

	useEffect(() => {
		// if (!isAuthentificated) return;
		const fetchUserData = async () => {
			// Fetch the user data from the server
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
				} else {
					logOut();
				}
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		if (isAuthentificated) fetchUserData();
		return () => {
			userData?.chatSocket?.endConnection();
			// when unmounting desktop component, reset userData
			setUserData(null);
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

	/* ********************************************************************* */
	/* **************************** CHAT SOCKET **************************** */
	/* ********************************************************************* */

	/**
	 * Friends connections checking
	 */

	const [friends, setFriends] = useState<IFriendStruct[]>([]);

	useEffect(() => {
		// TODO: instead of just storing them in a State, the user context should simply be updated so all other components that use it can be re-rendered (I think)
		// TODO: if the user is not auth the map method cannot iterate since the friends variable is not an array. Should not be an issue since only logged in users can access the desktop but it might be better to think ahead for this
		fetch('/api/user/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setFriends(data);
			});
	}, []);

	/**
	 * Listens for a 'userLoggedIn' message and compares its id with the id
	 * of its friends to know which ones are connected
	 * Emits back a response so the friend that just connected knows the
	 * current user is connected too
	 */
	useEffect(() => {
		const handleLoggedIn = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (
						friend.id === data &&
						(friend.onlineStatus === false || friend.onlineStatus === undefined)
					) {
						nbFriendsOnline++;
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onClientLogIn(handleLoggedIn);
	}, [userData]);

	/**
	 * listens for a 'ClientLogInResponse' to check on connection which friends
	 * were connected
	 */
	useEffect(() => {
		const handleLoggedInResponse = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (
						friend.id === data &&
						(friend.onlineStatus === false || friend.onlineStatus === undefined)
					) {
						nbFriendsOnline++;
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onClientLogInResponse(handleLoggedInResponse);
	}, [userData]);

	// listen for a `ClientLogOut`
	useEffect(() => {
		const handleLoggedOut = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (friend.id === data && friend.onlineStatus === true) {
						nbFriendsOnline--;
						return { ...friend, onlineStatus: false };
					} else {
						return friend;
					}
				}),
			);
		};
		userData?.chatSocket?.onLogOut(handleLoggedOut);
	}, [userData]);

	return (
		<div className="desktopWrapper" ref={windowDragConstraintRef}>
			<DesktopIcon
				name="Game"
				iconSrc={GameIcon}
				id={++iconId}
				onDoubleClick={() => setFriendsWindowIsOpen(true)}
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
				onDoubleClick={() => setPrivateMessageWindowIsOpen(true)}
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
						login={userData ? userData?.login : ''}
						onCloseClick={() => setProfileWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
				{openFriendsWindow && (
					<FriendsList
						onCloseClick={() => setFriendsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						friends={friends}
						nbFriendsOnline={nbFriendsOnline}
					/>
				)}
				{privateMessageWindowIsOpen && (
					<PrivateMessages
						onCloseClick={() => setPrivateMessageWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						friends={friends}
						chatWindowControl={setChatWindowIsOpen}
					/>
				)}
				{channelsWindowIsOpen && (
					<Channels
						onCloseClick={() => setChannelsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
					/>
				)}
				{chatWindowIsOpen && (
					<ChatWindow
						onCloseClick={() => setChannelsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						login="Jee"
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Desktop;
