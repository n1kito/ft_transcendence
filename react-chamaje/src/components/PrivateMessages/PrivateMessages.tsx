import React, { useContext, useEffect, useState } from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { IFriendStruct } from '../Desktop/Desktop';
import ChatWindow from '../ChatWindow/ChatWindow';
import useAuth from 'src/hooks/userAuth';
import { UserContext } from 'src/contexts/UserContext';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';
import Button from '../Shared/Button/Button';
import mysteryBox from '../Profile/Components/TargetBadge/images/mysteryBox.png';

import {
	createChatPrivateMessage,
	fetchChats,
	fetchMessages,
	findUserByLogin,
	getBlockedUsers,
} from 'src/utils/queries';
import { ChatContext, IChatStruct, IMessage } from 'src/contexts/ChatContext';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setProfileLogin: React.Dispatch<React.SetStateAction<string>>;
	setGameWindowIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	// chatWindowControl: (state: boolean) => void;
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	setShowFriendProfile,
	setProfileLogin,
	setGameWindowIsOpen,
	// chatWindowControl,
}) => {
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatWindowName, setChatWindowName] = useState('');
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [searchedLogin, setSearchedLogin] = useState('');
	const [searchUserError, setSearchUserError] = useState('');
	const [searchUserSuccess, setSearchUserSuccess] = useState('');
	const { userData } = useContext(UserContext);
	const { accessToken } = useAuth();
	const {
		chatData,
		updateChatData,
		updateChatList,
		getNewChatsList,
		getNewBlockedUsers,
	} = useContext(ChatContext);

	/* ********************************************************************* */
	/* ***************************** WEBSOCKET ***************************** */
	/* ********************************************************************* */

	// LISTENER: when receiving a message in active chat
	// listen for a message everytime the chatId changes
	useEffect(() => {
		if (!chatData.socket) {
			return;
		}
		const onReceiveMessage = (message: IMessage) => {
			// if the user was blocked, dont display it
			for (const current of chatData.blockedUsers) {
				if (message.sentById === current.userBlockedId) return;
			}
			// if it is the active chat, load message
			if (message.chatId === chatWindowId) {
				const updatedMessages: IMessage[] = messages.map((val) => {
					return val;
				});
				updatedMessages.push(message);
				setMessages(updatedMessages);
			} else {

				// notifications : copy the chat list and add newMessage to the chat concerned
				let updatedChatList: IChatStruct[] = [];
				for (const current of chatData.chatsList) {
					if (current.chatId === message.chatId) {
						const newChat: IChatStruct = {
							...current,
							newMessage: true,
						};
						updatedChatList.push(newChat);
					} else {
						updatedChatList.push(current);
					}
					getNewChatsList(updatedChatList);
				}
			}
		};
		chatData.socket?.onReceiveMessage(onReceiveMessage);

		// stop listening to messages
		return () => {
			chatData.socket?.offReceiveMessage(onReceiveMessage);
			// userData.chatSocket?.offReceiveMessage(onReceiveMessage);
		};
	}, [chatWindowId, messages, chatData.chatsList]);

	// on chatlist change, join rooms
	// it is okay to join multiple times the same rooms, socket io ignores it
	useEffect(() => {
		if (!chatData.socket) {
			return;
		}
		for (const current of chatData.chatsList) {
			chatData.socket.joinRoom(current.chatId);
		}
	}, [chatData.chatsList]);

	
	/* ********************************************************************* */
	/* ******************************* LOGIC ******************************* */
	/* ********************************************************************* */

	// on mounting this component, fetch the privateMessages
	useEffect(() => {
		fetchChats(accessToken)
			.then((data) => {
				getNewChatsList(data);
				// updateChatList(data);
				getBlockedUsers(accessToken)
					.then((users) => {
						console.warn('I fetched my blocked users', users);
						getNewBlockedUsers(users);
					})
					.catch(() => {
						console.error('Could not retreive blocked users');
					});
			})
			.catch((e) => {
				console.error('Error fetching private conversations: ', e);
				console.warn('userData', userData);
			});
	}, []);

	// on click on an avatar, check if a PM conversation exists.
	// If it does, open the window, set the userId and chatId, and fetch
	// the messages.
	// Otherwise open clean the messages and open the window
	const openPrivateMessageWindow: any = (roomId: number, friendId: number) => {
		let foundChat = false;
		const chatId = chatData.chatsList.map((currentChat) => {
			if (roomId === currentChat.chatId) {
				setChatWindowId(currentChat.chatId);
				setChatWindowName(currentChat.name);
				// notifications : set new Message to false when opened
				let updatedChatList: IChatStruct[] = [];
				for (const current of chatData.chatsList) {
					if (current.chatId === roomId) {
						const newChat: IChatStruct = {
							chatId: current.chatId,
							participants: current.participants,
							name: current.name,
							avatar: current.avatar,
							isChannel: current.isChannel,
							onlineIndicator: current.onlineIndicator,
							newMessage: false,
						};
						updatedChatList.push(newChat);
					} else {
						updatedChatList.push(current);
					}
					getNewChatsList(updatedChatList);
				}
				fetchMessages(currentChat.chatId, accessToken)
					.then((data) => {
						setMessages(data);
					})
					.catch((e) => {
						console.error('Error fetching messages: ', e);
					});
				foundChat = true;
				return;
			}
		});
		setChatWindowIsOpen(true);
		// If no corresponding chat were found, create it, set messages to empty
		// change the chat window and update privateMessages[]
		if (!foundChat && userData) {
			createChatPrivateMessage(friendId, userData.id, accessToken)
				.then(async (data) => {
					setChatWindowId(data);
					setMessages([]);
					fetchChats(accessToken)
						.then((data) => {
							updateChatList(data);
						})
						.catch((e) => {
							console.error('Error fetching private conversations: ', e);
						});
				})
				.catch((e) => {
					console.error('Error creating chat: ', e);
				});
			console.error('This chat does not exist');
		}
	};

	// find the user by login and create the chat
	const createNewChatFromLogin = () => {
		if (searchedLogin) {
			findUserByLogin(searchedLogin, accessToken)
				// .then((response) => response.json())
				.then(async (data) => {
					if (data.message) {
						throw new Error('User not found');
					}
					// if the user is found, create the PM and update the PM list
					if (!userData) {
						return;
					}
					createChatPrivateMessage(data.id, userData.id, accessToken)
						.then((room) => {
							setSearchUserSuccess('Chat created successfully!');
							updateChatList([
								{
									chatId: room.chatId,
									participants: [userData?.id ? userData.id : 0, data.id],
									name: searchedLogin,
									isChannel: false,
								},
							]);
							// TODO: Check if we still need to do the part before.
							// if without it we still get photos, remove it
							fetchChats(accessToken)
								.then((data) => {
									getNewChatsList(data);
								})
								.catch((e) => {
									console.error('Error fetching private conversations: ', e);
								});

							setSettingsPanelIsOpen(false);
						})
						.catch((e) => {
							console.error(e);
							setSearchUserError('Could not create chat');
						});
				})
				.catch((e: string) => {
					console.error(e);
					setSearchUserError('Could not find user');
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
			<div className="private-messages-window">
				<Window
					initialWindowPosition={{ bottom: 25, left: 25 }}
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
						{
							// if the chat list is not empty, display chat that are not channels
							chatData.chatsList.length > 0 &&
							chatData.chatsList.find(
								(current) => current.isChannel === false,
							) ? (
								chatData.chatsList.map((room, index) => {
									if (!room.isChannel) {
										// find the other participant id
										let participantId: number | undefined;
										userData && room.participants.at(0) !== userData.id
											? (participantId = room.participants.at(0))
											: (participantId = room.participants.at(1));

										// if it is a friend, display onlinestatus
										const friend = friends.find((friend) => {
											return friend.id === participantId;
										});
										return (
											<FriendBadge
												key={'PM' + room.chatId}
												badgeTitle={room.name || 'anonymous'}
												badgeImageUrl={
													room.name ? `/api/images/${room.avatar}` : mysteryBox
												}
												onlineIndicator={friend ? friend.onlineStatus : false}
												isClickable={true}
												onClick={() => {
													openPrivateMessageWindow(room.chatId, participantId);
												}}
												shaking={room.newMessage || false}
											/>
										);
									}
								})
							) : (
								<FriendBadge
									key={'PMEmptyFriendBadge'}
									isEmptyBadge={true}
									isChannelBadge={false}
									onClick={() => {
										setSettingsPanelIsOpen(true);
									}}
								/>
							)
						}
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
			</div>
			{chatWindowIsOpen && (
				<ChatWindow
					key={'ChatWindowInPM'}
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					name={chatWindowName}
					chatId={chatWindowId}
					messages={messages}
					setMessages={setMessages}
					setChatWindowIsOpen={setChatWindowIsOpen}
					setShowFriendProfile={setShowFriendProfile}
					setProfileLogin={setProfileLogin}
					setGameWindowIsOpen={setGameWindowIsOpen}
				/>
			)}
		</>
	);
};

export default PrivateMessages;
