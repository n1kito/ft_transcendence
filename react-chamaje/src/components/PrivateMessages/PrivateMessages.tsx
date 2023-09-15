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
import {
	createChatPrivateMessage,
	fetchMessages,
	fetchPrivateMessages,
	findUserByLogin,
} from 'src/utils/queries';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	// chatWindowControl: (state: boolean) => void;
}

export interface IChatStruct {
	chatId: number;
	participants: number[];
	name: string; // for the PM its the login
	avatar?: string;
	onlineIndicator?: boolean; // if it is a friend of us, show the online status
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	// chatWindowControl,
}) => {
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowUserId, setChatWindowUserId] = useState(0);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatWindowName, setChatWindowName] = useState('');
	const [privateMessages, setPrivateMessages] = useState<IChatStruct[]>([]);
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
	/* ******************************* DEBUG ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		console.log(' PrivateMessage - messages', messages);
	}, [messages]);
	useEffect(() => {
		console.log(' PrivateMessage - privateMessages', privateMessages);
	}, [privateMessages]);

	useEffect(() => {
		console.log(' PrivateMessage - chatWindowId', chatWindowId);
	}, [chatWindowId]);

	/* ********************************************************************* */
	/* ******************************* LOGIC ******************************* */
	/* ********************************************************************* */

	// on mounting this component, fetch the privateMessages
	useEffect(() => {
		fetchPrivateMessages(accessToken)
			.then((data) => {
				setPrivateMessages(data);
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
		const chatId = privateMessages.map((currentChat) => {
			// if (
			// 	currentChat.participants.length === 2 &&
			// 	(currentChat.participants.at(0) === friendId ||
			// 		currentChat.participants.at(1) === friendId)
			// ) {
			if (roomId === currentChat.chatId) {
				setChatWindowId(currentChat.chatId);
				setChatWindowName(currentChat.name);
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
					fetchPrivateMessages(accessToken)
						.then((data) => {
							setPrivateMessages(data);
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
		console.log('searchedLogin', searchedLogin);
		if (searchedLogin) {
			findUserByLogin(searchedLogin, accessToken)
				// .then((response) => response.json())
				.then(async (data) => {
					if (data.message) {
						throw new Error('User not found');
					}
					console.log('response data', data);
					// if the user is found, create the PM and update the PM list
					if (!userData) return;
					createChatPrivateMessage(data.id, userData.id, accessToken)
						.then(() => {
							setSearchUserSuccess('Chat created successfully!');
							fetchPrivateMessages(accessToken)
								.then((data) => {
									setPrivateMessages(data);
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
						{privateMessages.length > 0 ? (
							privateMessages.map((room, index) => {
								// find the other participant id
								let participantId: number | undefined;
								userData && room.participants.at(0) !== userData.id
									? (participantId = room.participants.at(0))
									: (participantId = room.participants.at(1));

								// if it is a friend, display onlinestatus
								const friend = friends.find((friend) => {
									return friend.id === participantId;
								});
								console.warn('You found a friend in me', friend);

								// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
								return (
									<FriendBadge
										key={index}
										badgeTitle={room.name}
										badgeImageUrl={`http://localhost:3000${room.avatar}`}
										onlineIndicator={friend ? friend.onlineStatus : false}
										isClickable={true}
										onClick={() => {
											openPrivateMessageWindow(room.chatId, participantId);
										}}
									/>
								);
							})
						) : (
							<FriendBadge
								isEmptyBadge={true}
								isChannelBadge={false}
								onClick={() => {
									setSettingsPanelIsOpen(true);
								}}
							/>
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
			</div>
			{chatWindowIsOpen && (
				<ChatWindow
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					// userId={chatWindowUserId}
					name={chatWindowName}
					chatId={chatWindowId}
					messages={messages}
					setMessages={setMessages}
					setChatsList={setPrivateMessages}
				/>
			)}
		</>
	);
};

export default PrivateMessages;
