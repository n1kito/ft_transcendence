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
import { ChatContext, IChatStruct, IMessage } from 'src/contexts/ChatContext';

interface IChannelsProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
}

const Channels: React.FC<IChannelsProps> = ({
	onCloseClick,
	windowDragConstraintRef,
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
				console.log(
					'%cYou received a message from another chat',
					'color:lightblue;',
				);
			}
		};
		chatData.socket?.onReceiveMessage(onReceiveMessage);
		// userData?.chatSocket?.onReceiveMessage(onReceiveMessage);

		// stop listening to messages
		// TODO: need to change that because I am not sure it will stop listening to the right room
		return () => {
			chatData.socket?.offReceiveMessage(onReceiveMessage);
			// userData.chatSocket?.offReceiveMessage(onReceiveMessage);
		};
	}, [chatWindowId, messages, chatData.chatsList]);

	// on click on an avatar, check if a PM conversation exists.
	// If it does, open the window, set the userId and chatId, and fetch
	// the messages.
	// Otherwise open clean the messages and open the window
	const openPrivateMessageWindow: any = (roomId: number) => {
		console.log('roomId', roomId);
		const chatId = chatData.chatsList.map((currentChat) => {
			if (roomId === currentChat.chatId) {
				setChatWindowId(currentChat.chatId);
				setChatWindowName(
					currentChat.name ? currentChat.name : 'Anonymous channel',
				);
				fetchMessages(currentChat.chatId, accessToken)
					.then((data) => {
						setMessages(data);
						setChatWindowIsOpen(true);
					})
					.catch((e) => {
						console.error('Error fetching messages: ', e);
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
					setChannelNameInput('');
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
	/* ******************************* DEBUG ******************************* */
	/* ********************************************************************* */

	// useEffect(() => {
	// 	console.log(' Channel - messages', messages);
	// }, [messages]);

	// useEffect(() => {
	// 	console.log('chatWindowIsOpen', chatWindowIsOpen);
	// }, [chatWindowIsOpen]);

	// useEffect(() => {
	// 	console.log('chatWindowId', chatWindowId);
	// }, [chatWindowId]);

	// useEffect(() => {
	// 	console.log('channelsList', channelsList);
	// }, [channelsList]);

	// useEffect(() => {
	// 	console.log('channelNameInput', channelNameInput);
	// }, [channelNameInput]);

	// useEffect(() => {
	// 	console.log('chatData.chatsList', chatData.chatsList);
	// }, [chatData.chatsList]);
	// useEffect(() => {
	// 	console.log('chatWindowName', chatWindowName);
	// }, [chatWindowName]);

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
						},
					},
					{
						name: 'Join channel',
						onClick: () => {
							setSettingsMode('join');
							setSettingsPanelIsOpen(true);
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
							<Title highlightColor="yellow">Password</Title>

							<InputField
								onChange={handlePwdInput}
								error={settingsPwdError}
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
				/>
			)}
		</>
	);
};

export default Channels;
