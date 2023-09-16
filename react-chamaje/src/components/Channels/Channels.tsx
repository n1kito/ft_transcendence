import React, { useContext, useEffect, useState } from 'react';
import './Channels.css';
import Window from '../Window/Window';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Button from '../Shared/Button/Button';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';
import { IChatStruct } from '../PrivateMessages/PrivateMessages';
import useAuth from 'src/hooks/userAuth';
import { createChannel, fetchChannels, fetchMessages } from 'src/utils/queries';
import { UserContext } from 'src/contexts/UserContext';
import ChatWindow, { IMessage } from '../ChatWindow/ChatWindow';

interface IChannelsProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
}

const Channels: React.FC<IChannelsProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	const chatsList = [''];
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [settingsMode, setSettingsMode] = useState('');
	const [settingsError, setSettingsError] = useState('');
	// const [settingsSuccess, setSettingsSuccess] = useState('');

	const [channelsList, setChannelsList] = useState<IChatStruct[]>([]);

	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatWindowName, setChatWindowName] = useState('');

	const [messages, setMessages] = useState<IMessage[]>([]);

	const [channelInput, setChannelInput] = useState('');
	const { userData } = useContext(UserContext);

	const { accessToken } = useAuth();

	// on click on an avatar, check if a PM conversation exists.
	// If it does, open the window, set the userId and chatId, and fetch
	// the messages.
	// Otherwise open clean the messages and open the window
	const openPrivateMessageWindow: any = (roomId: number) => {
		const chatId = channelsList.map((currentChat) => {
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
		if (channelInput) {
			createChannel(accessToken, channelInput)
				.then(() => {
					fetchChannels(accessToken)
						.then((data) => {
							setChannelsList(data);
						})
						.catch((e) => {
							console.error('Error fetching channels: ', e);
						});
					setSettingsPanelIsOpen(false);
				})
				.catch((e) => {
					console.error('Error creating channel: ', e);
					setSettingsError('Could not create that channel');
				});
		}
	};

	const joinChannel = () => {};

	// every time I put a char in this, it fetches everything...
	// no it does not but it rerenders my list
	const handleChannelInput = (channel: string) => {
		setChannelInput(channel);
	};
	/* ********************************************************************* */
	/* ******************************* DEBUG ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		console.log(' Channel - messages', messages);
	}, [messages]);

	useEffect(() => {
		console.log('Is the Chatwindow open ?', chatWindowIsOpen);
	}, [chatWindowIsOpen]);

	useEffect(() => {
		console.log('chatWindowId', chatWindowId);
	}, [chatWindowId]);

	useEffect(() => {
		console.log('channelsList', channelsList);
	}, [channelsList]);

	/* ********************************************************************* */
	/* ******************************* RETURN ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		fetchChannels(accessToken)
			.then((data) => {
				setChannelsList(data);
			})
			.catch((e) => {
				console.error('Error fetching channels: ', e);
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
					{channelsList.length > 0 ? (
						channelsList.map((room, index) => {
							// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
							return (
								<FriendBadge
									key={index}
									badgeTitle={room.name ? room.name : 'Anonymous channel'}
									isChannelBadge={true}
									isClickable={true}
									onClick={() => {
										openPrivateMessageWindow(room.chatId);
									}}
								/>
							);
						})
					) : (
						<FriendBadge
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
							<InputField onChange={handleChannelInput}></InputField>
							<Button
								onClick={() => {
									settingsMode === 'create'
										? createNewChannel()
										: joinChannel();
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
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					// userId={chatWindowUserId}
					name={chatWindowName}
					chatId={chatWindowId}
					messages={messages}
					setMessages={setMessages}
					setChatsList={setChannelsList}
					isChannel={true}
					setChatWindowIsOpen={setChatWindowIsOpen}
				/>
			)}
		</>
	);
};

export default Channels;
