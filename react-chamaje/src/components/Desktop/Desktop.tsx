import React, { useContext, useEffect, useRef, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import Profile from '../Profile/Profile';
import { io } from 'socket.io-client';
import WebSocketService from 'src/services/WebSocketService';
import Button from './../Shared/Button/Button';
import { createRoot } from 'react-dom/client';
import PrivateMessages from '../PrivateMessages/PrivateMessages';
import { AnimatePresence } from 'framer-motion';
import ChatWindow from '../ChatWindow/ChatWindow';

import ProfileIcon from './Icons/CARD.svg';
import ChatIcon from './Icons/PC.svg';
import FriendsIcon from './Icons/NOTEBOOK.svg';
import GameIcon from './Icons/CD.svg';
import Channels from '../Channels/Channels';
import { ChatContext } from 'src/contexts/ChatContext';
import {
	addFriend,
	deleteFriend,
	fetchFriends,
} from 'src/utils/FriendsQueries';
import { error } from 'console';

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
	const { userData, updateUserData, resetUserData } = useContext(UserContext);
	const { chatData, updateChatData } = useContext(ChatContext);
	const [openFriendsWindow, setFriendsWindowIsOpen] = useState(false);
	const [openProfileWindow, setProfileWindowIsOpen] = useState(false);
	const [privateMessageWindowIsOpen, setPrivateMessageWindowIsOpen] =
		useState(false);
	const [channelsWindowIsOpen, setChannelsWindowIsOpen] = useState(false);

	const [showFriendProfile, setShowFriendProfile] = useState(false);

	const [friendLogin, setFriendLogin] = useState('');
	const [deletedFriend, setDeletedFriend] = useState('');
	const [addedFriend, setAddedFriend] = useState('');
	const [profileError, setProfileError] = useState('');
	const [nbOnline, SetNbOnline] = useState(0);

	const [isMyFriend, setIsMyFriend] = useState(false);
	const navigate = useNavigate();
	const {
		isAuthentificated,
		setIsAuthentificated,
		refreshToken,
		logOut,
		accessToken,
		setIsTwoFAEnabled,
		isTwoFAEnabled,
	} = useAuth();

	const windowDragConstraintRef = useRef(null);

	const fetchUserData = async () => {
		// Fetch the user data from the server
		try {
			const response = await fetch(`/api/user/${'me'}`, {
				method: 'GET',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				const data = await response.json();

				// const imagePath = `/api/images/${data.image}`;
				const mySocket = new WebSocketService(accessToken, data.id);
				updateChatData({
					socket: mySocket,
				});

				const updatedData = {
					...data,
					image: `/api/images/${data.image}`,
				};
				// Set the user data in the context
				updateUserData(updatedData);
				setIsTwoFAEnabled(data.isTwoFactorAuthenticationEnabled);
			} else {
				logOut();
			}
		} catch (error) {
			console.log('Error: ', error);
		}
	};
	useEffect(() => {
		if (isAuthentificated) fetchUserData();

		return () => {
			chatData.socket?.endConnection();
			// userData?.chatSocket?.endConnection();
			// when unmounting desktop component, reset userData
			resetUserData();
		};
	}, []);

	useEffect(() => {
		window.addEventListener('unload', handleTabClosing);
		return () => {
			window.removeEventListener('unload', handleTabClosing);
		};
	});

	const handleTabClosing = () => {
		chatData.socket?.endConnection();
		resetUserData();
	};

	/* ********************************************************************* */
	/* **************************** CHAT SOCKET **************************** */
	/* ********************************************************************* */

	/**
	 * Friends connections checking
	 */

	const [friends, setFriends] = useState<IFriendStruct[]>([]);

	// fetch user's friend to set friends state
	useEffect(() => {
		if (isAuthentificated) {
			fetchFriends(accessToken)
				.then(async (data) => {
					setFriends(data);
				})
				.catch((error) => {
					console.error('could not fetch friends: ', error);
				});
		}
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
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		chatData.socket?.onClientLogIn(handleLoggedIn);
		// userData?.chatSocket?.onClientLogIn(handleLoggedIn);
	}, [chatData]);

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
						return { ...friend, onlineStatus: true };
					} else {
						return friend;
					}
				}),
			);
		};
		chatData.socket?.onClientLogInResponse(handleLoggedInResponse);
		// userData?.chatSocket?.onClientLogInResponse(handleLoggedInResponse);
	}, [chatData]);

	// listen for a `ClientLogOut`
	useEffect(() => {
		const handleLoggedOut = (data: number) => {
			setFriends((prevFriends) =>
				prevFriends.map((friend) => {
					if (friend.id === data && friend.onlineStatus === true) {
						return { ...friend, onlineStatus: false };
					} else {
						return friend;
					}
				}),
			);
		};
		chatData.socket?.onLogOut(handleLoggedOut);
		// userData?.chatSocket?.onLogOut(handleLoggedOut);
	}, [chatData]);

	useEffect(() => {
		updateNbOnline();
	}, [friends]);

	const updateNbOnline = () => {
		let nbFriendsOnline = 0;
		friends.map((currentFriend) => {
			currentFriend.onlineStatus ? ++nbFriendsOnline : nbFriendsOnline;
		});
		SetNbOnline(nbFriendsOnline);
	};

	/* ********************************************************************* */
	/* **************************** FRIENDS ******************************** */
	/* ********************************************************************* */

	// on badge click, display friend's profile
	const handleBadgeClick = (friendLogin: string) => {
		setFriendLogin(friendLogin);
		setIsMyFriend(true);
		setShowFriendProfile(true);
	};

	// when friend is deleted, filters out the deleted one from friends array state
	useEffect(() => {
		const updateFriends = async () => {
			// copy friends
			const updatedFriends = [...friends];
			// filter out the deleted friend
			const filteredFriends = updatedFriends.filter(
				(friend) => friend.login !== deletedFriend,
			);
			// update state with filtered friends
			setFriends(filteredFriends);
			// reset deletedFriend state
			setDeletedFriend('');
		};
		if (!showFriendProfile && deletedFriend) updateFriends();
	}, [deletedFriend]);

	// when friend is added, friends array state is updated
	useEffect(() => {
		const updateFriends = async () => {
			addFriend(addedFriend, accessToken)
				.then(async (data) => {
					// copy friends
					const updatedFriends = [...friends];
					// check if friend to be added is not already in the friends list
					if (!friends.some((friend) => friend.login === data.login)) {
						// create friend object for <IFriendStruct>
						const newFriend = {
							id: data.id,
							login: data.login,
							image: data.image,
							onlineStatus: false,
						};
						// add the new friend to the existing friends list
						const updatedFriends = [...friends, newFriend];
						// update the state with the updated friends list
						setFriends(updatedFriends);
						// ping to update online status
						chatData.socket?.sendServerConnection();
						// reset AddedFriend state
						setAddedFriend('');
					}
				})
				.catch((error) => {
					setAddedFriend('');
				});
		};
		if (!showFriendProfile && addedFriend) {
			updateFriends();
		}
	}, [addedFriend]);

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
						key="profile-window"
						login={userData?.login}
						setLogin={setFriendLogin}
						isMyFriend={false}
						onCloseClick={() => setProfileWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						nbOnline={nbOnline}
						setNbOnline={SetNbOnline}
					/>
				)}
				{openFriendsWindow && (
					<FriendsList
						key="Friend-list-window"
						onCloseClick={() => setFriendsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						friends={friends}
						nbFriendsOnline={nbOnline}
						onBadgeClick={handleBadgeClick}
						setFriends={setFriends}
						setShowFriendProfile={setShowFriendProfile}
						setProfileLogin={setFriendLogin}
						setIsMyFriend={setIsMyFriend}
					/>
				)}
				{showFriendProfile && (
					<Profile
						login={friendLogin}
						onCloseClick={() => {
							setProfileWindowIsOpen(false), setShowFriendProfile(false);
						}}
						windowDragConstraintRef={windowDragConstraintRef}
						isMyFriend={isMyFriend}
						nbOnline={nbOnline}
						setNbOnline={SetNbOnline}
						setShowFriendProfile={setShowFriendProfile}
						setDeletedFriend={setDeletedFriend}
						setAddedFriend={setAddedFriend}
					></Profile>
				)}

				{privateMessageWindowIsOpen && (
					<PrivateMessages
						key={'pmKeyInDesktop'}
						onCloseClick={() => setPrivateMessageWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						friends={friends}
						// chatWindowControl={setChatWindowIsOpen}
						setShowFriendProfile={setShowFriendProfile}
						setProfileLogin={setFriendLogin}
					/>
				)}
				{channelsWindowIsOpen && (
					<Channels
						key="channelKeyInDesktop"
						onCloseClick={() => setChannelsWindowIsOpen(false)}
						windowDragConstraintRef={windowDragConstraintRef}
						setShowFriendProfile={setShowFriendProfile}
						setProfileLogin={setFriendLogin}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Desktop;
