import React, { useContext, useEffect, useState } from 'react';
import './Channels.css';
import Window from '../Window/Window';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Button from '../Shared/Button/Button';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';
// import { IChatStruct } from '../PrivateMessages/PrivateMessages';
import useAuth from 'src/hooks/userAuth';
import {
	createChannel,
	fetchChannels,
	fetchMessages,
	getBlockedUsers,
	joinChannel,
} from 'src/utils/queries';
import { UserContext } from 'src/contexts/UserContext';
import ChatWindow from '../ChatWindow/ChatWindow';
import {
	ChatContext,
	IChatStruct,
	IMessage,
	IUserAction,
} from 'src/contexts/ChatContext';

interface IChannelsProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setProfileLogin: React.Dispatch<React.SetStateAction<string>>;
}

const Channels: React.FC<IChannelsProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	setShowFriendProfile,
	setProfileLogin,
}) => {
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingsMode, setSettingsMode] = useState('');
	const [settingsNameError, setSettingsNameError] = useState('');
	const [settingsPwdError, setSettingsPwdError] = useState('');
	// const [settingsSuccess, setSettingsSuccess] = useState('');

	const [channelsList, setChannelsList] = useState<IChatStruct[]>([]);

	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatWindowName, setChatWindowName] = useState('');

	const [messages, setMessages] = useState<IMessage[]>([]);

	const [channelNameInput, setChannelNameInput] = useState('');
	const [pwdInput, setPwdInput] = useState('');

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
				console.log(
					'%cYou received a message from another chat',
					'color:lightblue;',
				);
			}
		};
		chatData.socket?.onReceiveMessage(onReceiveMessage);
		// userData?.chatSocket?.onReceiveMessage(onReceiveMessage);

		// stop listening to messages
		return () => {
			chatData.socket?.offReceiveMessage(onReceiveMessage);
			// userData.chatSocket?.offReceiveMessage(onReceiveMessage);
		};
	}, [chatWindowId, messages, chatData.chatsList]);

	// listen for kick/ban message
	useEffect(() => {
		if (!chatData.socket) {
			return;
		}
		const onKick = (data: IUserAction) => {
			if (data.userId === userData?.id) {
				const updatedChatsList = chatData.chatsList.filter(
					(channel) => channel.chatId !== data.chatId,
				);
				chatData.socket?.leaveRoom(data.chatId);
				getNewChatsList(updatedChatsList);
				if (data.chatId === chatWindowId) setChatWindowIsOpen(false);
			}
		};
		chatData.socket?.onKick(onKick);
		return () => {
			chatData.socket?.offKick(onKick);
		};
	}, [chatData.chatsList]);

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
	/* ********************************************************************* */
	/* ********************************************************************* */

	// on click on an avatar open the window, set the userId and chatId, and fetch
	// the messages.
	const openPrivateMessageWindow: any = (roomId: number) => {
		console.log('roomId', roomId);
		const chatId = chatData.chatsList.map((currentChat) => {
			if (roomId === currentChat.chatId) {
				setChatWindowId(currentChat.chatId);
				setChatWindowName(
					currentChat.name ? currentChat.name : 'Anonymous channel',
				);
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
						setChatWindowIsOpen(true);
					})
					.catch((e) => {
						console.error('Error fetching messages: ', e.message);
					});
				return;
			}
		});
	};

	const createNewChannel = () => {
		if (channelNameInput) {
			createChannel(accessToken, channelNameInput, pwdInput)
				.then((room) => {
					updateChatList([
						{
							chatId: room.chatId,
							participants: [userData?.id ? userData.id : 0],
							name: channelNameInput,
							isChannel: true,
						},
					]);
					setSettingsPanelIsOpen(false);
				})
				.then(() => {
					setChannelNameInput('');
					setPwdInput('');
				})
				.catch((e) => {
					console.error('Error creating channel: ', e.message);
					setSettingsNameError(e.message);
				});
		}
	};

	const handleJoinChannel = () => {
		if (channelNameInput) {
			joinChannel(accessToken, channelNameInput, pwdInput)
				.then((data) => {
					setSettingsPanelIsOpen(false);
					updateChatList([
						{
							chatId: data.chatId,
							participants: data.participants,
							name: channelNameInput,
							isChannel: true,
						},
					]);
					console.log('Channel joined successfully');
				})
				.then(() => {
					setChannelNameInput('');
					setPwdInput('');
				})
				.catch((e) => {
					setSettingsNameError(e.message);
					console.error('Could not join channel: ', e.message);
				});
		}
	};

	// every time I put a char in this, it fetches everything...
	// no it does not but it rerenders my list
	const handleChannelNameInput = (channel: string) => {
		setChannelNameInput(channel);
	};

	// every time I put a char in this, it fetches everything...
	// no it does not but it rerenders my list
	const handlePwdInput = (pwd: string) => {
		setPwdInput(pwd);
	};

	/* ********************************************************************* */
	/* ******************************* RETURN ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		fetchChannels(accessToken)
			.then((data) => {
				getNewChatsList(data);
			})
			.catch((e) => {
				console.error('Error fetching channels: ', e);
			});
		getBlockedUsers(accessToken)
			.then((data) => {
				getNewBlockedUsers(data);
			})
			.catch(() => {
				console.error('Could not retreive blocked users');
			});
	}, []);

	return (
		<>
			<Window
				windowTitle="Channels"
				useBeigeBackground={true}
				onCloseClick={onCloseClick}
				key="channels-window"
				windowDragConstraintRef={windowDragConstraintRef}
				links={[
					{
						name: 'New channel',
						onClick: () => {
							setSettingsMode('create');
							setSettingsPanelIsOpen(true);
							setSettingsNameError('');
						},
					},
					{
						name: 'Join channel',
						onClick: () => {
							setSettingsMode('join');
							setSettingsPanelIsOpen(true);
							setSettingsNameError('');
						},
					},
				]}
			>
				<div className="channels-list-wrapper">
					{chatData.chatsList.length > 0 &&
					chatData.chatsList.find((current) => current.isChannel === true) ? (
						chatData.chatsList.map((room, index) => {
							if (room.isChannel) {
								// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
								return (
									<FriendBadge
										key={'Channel' + room.chatId}
										badgeTitle={room.name ? room.name : 'Anonymous channel'}
										isChannelBadge={true}
										isClickable={true}
										onClick={() => {
											openPrivateMessageWindow(room.chatId);
										}}
										shaking={room.newMessage || false}
									/>
								);
							}
						})
					) : (
						<FriendBadge
							key={'ChannelEmptyFriendBadge'}
							isEmptyBadge={true}
							isChannelBadge={true}
							onClick={() => {
								setTimeout(() => {
									setSettingsPanelIsOpen(true);
									setSettingsMode('create');
								}, 100);
							}}
						/>
					)}
				</div>
				{settingsPanelIsOpen && (
					<SettingsWindow settingsWindowVisible={setSettingsPanelIsOpen}>
						<Title highlightColor="yellow">Channel name</Title>
						<div className="settings-form">
							<InputField
								onChange={handleChannelNameInput}
								error={settingsNameError}
							></InputField>
						</div>
						<Title highlightColor="yellow">Password</Title>
						<div className="settings-form">
							<InputField
								onChange={handlePwdInput}
								error={settingsPwdError}
								isPassword={true}
							></InputField>
							<Button
								onClick={() => {
									settingsMode === 'create'
										? createNewChannel()
										: handleJoinChannel();
								}}
							>
								{settingsMode} channel
							</Button>
						</div>
					</SettingsWindow>
				)}
			</Window>
			{chatWindowIsOpen && (
				<ChatWindow
					key={'ChatWindowInChannel'}
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					// userId={chatWindowUserId}
					name={chatWindowName}
					chatId={chatWindowId}
					messages={messages}
					setMessages={setMessages}
					isChannel={true}
					setChatWindowIsOpen={setChatWindowIsOpen}
					setShowFriendProfile={setShowFriendProfile}
					setProfileLogin={setProfileLogin}
				/>
			)}
		</>
	);
};

export default Channels;
