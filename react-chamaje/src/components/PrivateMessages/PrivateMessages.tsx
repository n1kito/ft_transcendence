import React, { useContext, useEffect, useState } from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { IFriendStruct } from '../Desktop/Desktop';
import ChatWindow, { IMessage } from '../ChatWindow/ChatWindow';
import useAuth from 'src/hooks/userAuth';
import { UserContext } from 'src/contexts/UserContext';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';
import Button from '../Shared/Button/Button';
import { error } from 'console';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	// chatWindowControl: (state: boolean) => void;
}

export interface IChatStruct {
	chatId: number;
	participants: number[];
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	// chatWindowControl,
}) => {
	const chatsList = [''];
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowUserId, setChatWindowUserId] = useState(0);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatsJoined, setChatsJoined] = useState<IChatStruct[]>([]);
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [searchedLogin, setSearchedLogin] = useState('');
	const [searchUserError, setSearchUserError] = useState('');
	const [searchUserSuccess, setSearchUserSuccess] = useState('');
	const { userData, setUserData } = useContext(UserContext);
	const { accessToken } = useAuth();

	/* ********************************************************************* */
	/* ***************************** WEBSOCKET ***************************** */
	/* ********************************************************************* */

	// LISTENER: when receiving a message in active chat
	// listen for a message everytime the chatId changes
	useEffect(() => {
		if (!userData || !userData.chatSocket) {
			console.warn('your userData was not set up yet');
			return;
		}
		const onReceiveMessage = (message: IMessage) => {
			// if it is the active chat, load message
			if (message.chatId === chatWindowId) {
				const updatedMessages: IMessage[] = messages.map((val) => {
					return val;
				});
				updatedMessages.push(message);
				setMessages(updatedMessages);
			} else {
				console.log(
					'%cYou received a message from another chat',
					'color:lightblue;',
				);
			}
		};
		// userData?.chatSocket?.onReceiveMessage(onReceiveMessage);
		userData?.chatSocket?.onReceiveMessage(onReceiveMessage);

		// stop listening to messages
		// TODO: need to change that because I am not sure it will stop listening to the right room
		return () => {
			userData.chatSocket?.offReceiveMessage(onReceiveMessage);
		};
	}, [chatWindowId, messages]);

	/* ********************************************************************* */
	/* ******************************* FETCH ******************************* */
	/* ********************************************************************* */

	async function fetchMessages(chatId: number) {
		fetch('api/chat/chatMessages/' + chatId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setMessages(data);
			});
	}

	async function fetchChatsJoined() {
		fetch('/api/user/me/chatsJoined', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setChatsJoined(data);
			});
	}

	async function createChat(friendId: number) {
		return fetch('api/chat/createChatPrivateMessage/' + friendId, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({
				isChannel: false,
				isPrivate: true,
				isProtected: false,
				userId: friendId,
			}),
		});
	}

	//findUserWithLogin
	async function findUserByLogin(login: string) {
		return fetch('api/user/byLogin/' + login, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		});
	}

	/* ********************************************************************* */
	/* ******************************* DEBUG ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		console.log(' PrivateMessage - messages', messages);
	}, [messages]);
	useEffect(() => {
		console.log(' PrivateMessage - chatsJoined', chatsJoined);
	}, [chatsJoined]);

	useEffect(() => {
		console.log(' PrivateMessage - chatWindowId', chatWindowId);
	}, [chatWindowId]);

	/* ********************************************************************* */
	/* ******************************* LOGIC ******************************* */
	/* ********************************************************************* */

	// on mounting this component, fetch the chatsJoined
	useEffect(() => {
		fetchChatsJoined();
	}, []);

	// on click on an avatar, check if a PM conversation exists.
	// If it does, open the window, set the userId and chatId, and fetch
	// the messages.
	// Otherwise open clean the messages and open the window
	const openPrivateMessageWindow: any = (friendId: number) => {
		let foundChat = false;
		const chatId = chatsJoined.map((currentChat) => {
			if (
				currentChat.participants.length === 2 &&
				(currentChat.participants.at(0) === friendId ||
					currentChat.participants.at(1) === friendId)
			) {
				setChatWindowId(currentChat.chatId);
				fetchMessages(currentChat.chatId);
				foundChat = true;
				return;
			}
		});
		setChatWindowIsOpen(true);
		setChatWindowUserId(friendId);
		// If no corresponding chat were found, create it, set messages to empty
		// change the chat window and update chatsJoined[]
		if (!foundChat) {
			createChat(friendId)
				.then((response) => response.json())
				.then((data) => {
					setChatWindowId(data);
					setMessages([]);
					fetchChatsJoined();
				});
			console.error('This chat does not exist');
		}
	};

	// find the user by login and create the chat
	const createNewChatFromLogin = () => {
		console.log('searchedLogin', searchedLogin);
		if (searchedLogin) {
			findUserByLogin(searchedLogin)
				.then((response) => response.json())
				.then((data) => {
					if (data.message) {
						throw new Error('User not found');
					}
					console.log('response data', data);
					createChat(data.id);
					setSearchUserSuccess('Chat created successfully!');
				})
				.catch((e: string) => {
					console.error(e);
					setSearchUserError('User not found');
				});
		}
	};

	const handleLoginChange = (login: string) => {
		setSearchedLogin(login);
		setSearchUserError('');
		setSearchUserSuccess('');
	};

	/* ********************************************************************* */
	/* ******************************* RETURN ****************************** */
	/* ********************************************************************* */
	return (
		<>
			<Window
				windowTitle="Private Messages"
				useBeigeBackground={true}
				onCloseClick={onCloseClick}
				key="private-messages-window"
				windowDragConstraintRef={windowDragConstraintRef}
				links={[
					{
						name: 'New Chat',
						onClick: () => {
							setSettingsPanelIsOpen(true);
						},
					},
				]}
			>
				<PrivateMessagesList>
					{chatsList.length > 0 ? (
						friends.map((friend, index) => (
							// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
							<FriendBadge
								key={index}
								badgeTitle={friend.login}
								badgeImageUrl={`http://localhost:3000${friend.image}`}
								onlineIndicator={friend.onlineStatus}
								isClickable={true}
								onClick={() => {
									openPrivateMessageWindow(friend.id);
								}}
							/>
						))
					) : (
						<FriendBadge isEmptyBadge={true} isChannelBadge={false} />
					)}
				</PrivateMessagesList>
				{settingsPanelIsOpen && (
					<SettingsWindow settingsWindowVisible={setSettingsPanelIsOpen}>
						<Title highlightColor="yellow">User name</Title>
						<div className="settings-form">
							<InputField
								onChange={handleLoginChange}
								error={searchUserError}
								success={searchUserSuccess}
							></InputField>
							<Button
								onClick={() => {
									createNewChatFromLogin();
								}}
							>
								create chat
							</Button>
						</div>
					</SettingsWindow>
				)}
			</Window>
			{chatWindowIsOpen && (
				<ChatWindow
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					userId={chatWindowUserId}
					chatId={chatWindowId}
					messages={messages}
					setMessages={setMessages}
				/>
			)}
		</>
	);
};

export default PrivateMessages;
