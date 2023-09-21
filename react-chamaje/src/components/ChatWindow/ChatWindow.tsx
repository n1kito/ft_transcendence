import React, {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import './ChatWindow.css';
import Window from '../Window/Window';
import Button from '../Shared/Button/Button';
import ChatBubble from './Components/ChatBubble/ChatBubble';
import { UserContext } from '../../contexts/UserContext';
import ChattNotification from './Components/ChattNotification/ChattNotification';
import ChatGameInvite from './Components/ChatGameInvite/ChatGameInvite';
import SettingsWindow from '../Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Title from '../Profile/Components/Title/Title';
import InputField from '../Profile/Components/InputField/InputField';
import useAuth from 'src/hooks/userAuth';
import DOMPurify from 'dompurify';
import {
	fetchChannels,
	fetchPrivateMessages,
	getAdminRights,
	getChatInfo,
	leaveChat,
	makePrivate,
	sendMessageQuery,
	setNewPassword,
} from 'src/utils/queries';
// import { IChatStruct } from '../PrivateMessages/PrivateMessages';
import { ChatContext, IChatStruct, IMessage } from 'src/contexts/ChatContext';

export interface IChatWindowProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	name: string;
	chatId: number;
	messages: IMessage[];
	isChannel?: boolean;
	setChatWindowIsOpen: Dispatch<SetStateAction<boolean>>;
	setMessages: Dispatch<SetStateAction<IMessage[]>>;
}

// export interface IMessage {
// 	chatId: number;
// 	sentById: number;
// 	sentAt: Date;
// 	content: string;
// 	login: string;
// 	avatar?: string;
// }

interface IChatInfo {
	isChannel: boolean;
	isPrivate: boolean;
	isProtected: boolean;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: true,
};

const ChatWindow: React.FC<IChatWindowProps> = ({
	// userId,
	name,
	onCloseClick,
	windowDragConstraintRef,
	chatId,
	messages,
	setMessages,
	isChannel = false,
	setChatWindowIsOpen,
}) => {
	/* ********************************************************************* */
	/* ******************************* FRONT ******************************* */
	/* ********************************************************************* */

	const [textareaIsFocused, setTextareaIsFocused] = useState(false);
	const [textareaIsEmpty, setTextareaIsEmpty] = useState(true);
	const [textareaContent, setTextareaContent] = useState('');
	const [pwdContent, setPwdContent] = useState('');

	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [channelIsPrivate, setChannelIsPrivate] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	const { userData } = useContext(UserContext);
	const { chatData, updateChatList, getNewChatsList } = useContext(ChatContext);
	const chatContentRef = useRef<HTMLDivElement>(null);

	const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = event.target.value;
		setTextareaContent(newValue);
		setTextareaIsEmpty(newValue === '');
	};

	// On enter, send the message if not empty
	const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (!textareaIsEmpty) sendMessage();
		}
	};

	const handlePwdInput = (newValue: string) => {
		// const newValue = event.target.value;
		setPwdContent(newValue);
	};

	// get the user to the last message
	useEffect(() => {
		const container = chatContentRef.current;
		container?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	/* ************************** links functions ************************** */
	const openSettingsPanel = () => {
		setSettingsPanelIsOpen(!settingsPanelIsOpen);
	};
	/* ********************************************************************* */
	/* ********************** channel links functions ********************** */

	const inviteToChannel = () => {};

	const leaveChannel = () => {
		leaveChat(accessToken, chatId)
			.then(async () => {
				const updatedChatsList = chatData.chatsList.filter(
					(channel) => channel.chatId !== chatId,
				);
				getNewChatsList(updatedChatsList, true);
				setChatWindowIsOpen(false);
			})
			.catch((e) => {
				console.error('Error leaving channel - chatWindow: ', e);
			});
	};

	/* ********************************************************************* */
	/* ************************* PM links functions ************************ */
	const leavePM = () => {
		leaveChat(accessToken, chatId)
			.then(async () => {
				// fetchPrivateMessages(accessToken)
				// 	.then((data) => setChatsList(data))
				// 	.catch((e) => {
				// 		console.error('Error fetching private messages: ', e);
				// 	});
				const updatedChatsList = chatData.chatsList.filter(
					(privateMessage) => privateMessage.chatId !== chatId,
				);
				getNewChatsList(updatedChatsList, false);
				setChatWindowIsOpen(false);
			})
			.catch((e) => {
				console.error('Error leaving chat - chatWindow: ', e);
			});
	};
	/* ********************************************************************* */

	// empty the textarea when changing active chat
	useEffect(() => {
		setTextareaContent('');
		setTextareaIsEmpty(true);
		getChatInfo(accessToken, chatId).then((chatInfo: IChatInfo) => {
			setChannelIsPrivate(chatInfo.isPrivate);
		});
	}, [chatId]);
	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */

	const { accessToken } = useAuth();

	// On mount, join the room associated with the chat
	// TODO: find a way to leave room when changing chat (because it is
	// not an unmounting)
	useEffect(() => {
		console.log('chatId in ChatWindow', chatId);
		if (chatId) chatData.socket?.joinRoom(chatId);
		// if (chatId) userData?.chatSocket?.joinRoom(chatId);
		// return () => {
		// 	userData?.chatSocket?.leaveRoom(chatId);
		// };
	}, [chatId]);

	// every time we change room, check if we are the owner (if its a channel)
	useEffect(() => {
		if (isChannel) {
			getAdminRights(accessToken, chatId)
				.then((data) => {
					setIsAdmin(data.isAdmin);
					setIsOwner(data.isOwner);
				})
				.catch((e) => {
					setIsAdmin(false);
					setIsOwner(false);
				});
		}
	}, [chatId]);

	const sendMessage = async () => {
		sendMessageQuery(accessToken, textareaContent, chatId)
			.then(() => {
				// socket sending message
				chatData.socket?.sendMessage(
					// userData?.chatSocket?.sendMessage(
					textareaContent,
					chatId,
					userData?.login || '',
					userData?.image || '',
				);
				// display users' own message by updating the messages[]
				const updatedMessages: IMessage[] = messages.map((val) => {
					return val;
				});
				updatedMessages.push({
					chatId: chatId,
					sentById: userData ? userData.id : 0,
					sentAt: new Date(),
					content: textareaContent,
					login: userData ? userData?.login : '',
				});
				setMessages(updatedMessages);
				setTextareaContent('');
				setTextareaIsEmpty(true);
			})
			.catch((e) => {
				console.error('Could not send message to the database: ', e);
			});
	};
	/* ********************************************************************* */
	/* ******************************* DEBUG ******************************* */
	/* ********************************************************************* */

	useEffect(() => {
		console.log('isOwner', isOwner);
	}, [isOwner]);

	useEffect(() => {
		console.log('isAdmin', isAdmin);
	}, [isAdmin]);

	useEffect(() => {
		console.log('pwdContent', pwdContent);
	}, [pwdContent]);

	/* ********************************************************************* */
	/* ******************************* RETURN ****************************** */
	/* ********************************************************************* */

	return (
		<Window
			windowTitle={isChannel ? name : `Chat with ${name}`}
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			links={
				isChannel
					? [
							isOwner || isAdmin || !channelIsPrivate
								? { name: 'Invite', onClick: inviteToChannel }
								: { name: '' },
							{ name: 'Leave', onClick: leaveChannel },
							isOwner || isAdmin
								? { name: 'Settings', onClick: openSettingsPanel }
								: { name: '' },
					  ]
					: [
							{ name: 'Profile', onClick: () => null },
							{ name: 'Play', onClick: () => null },
							{ name: 'Block', onClick: () => null },
							{ name: 'Leave chat', onClick: leavePM },
							{ name: 'Settings', onClick: openSettingsPanel },
					  ]
			}
			useBeigeBackground={true}
		>
			<div className="chat-wrapper">
				<div className="chat-content">
					{messages.map((currentMessage, index) => {
						const date: Date = new Date(currentMessage.sentAt);
						const messageWithNewlines = currentMessage.content.replace(
							/\n/g,
							'<br />',
						);
						// keep the message displayed safe from XSS attacks
						const sanitizedData = () => ({
							__html: DOMPurify.sanitize(messageWithNewlines),
						});
						const isLast = index === messages.length - 1;
						return (
							<ChatBubble
								userId={currentMessage.sentById}
								key={index}
								wasSent={
									userData && currentMessage.sentById === userData.id
										? true
										: false
								}
								sender={currentMessage.login}
								time={date.toLocaleString('en-US', dateFormatOptions)}
								senderAvatar={currentMessage.avatar}
							>
								{
									<div
										dangerouslySetInnerHTML={sanitizedData()}
										ref={isLast ? chatContentRef : undefined}
									/>
								}
							</ChatBubble>
						);
					})}
					{/* <ChattNotification type="Muted" sender="Nikito" recipient="Jee" />
					<ChatGameInvite sender="Jee" recipient="Nikito" /> */}
				</div>
				<div
					className={`chat-input ${
						textareaIsFocused || !textareaIsEmpty ? 'chat-input--focus' : ''
					}`}
				>
					<textarea
						value={textareaContent}
						onFocus={() => setTextareaIsFocused(true)}
						onBlur={() => setTextareaIsFocused(false)}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
					></textarea>
					<Button
						baseColor={[151, 51, 91]}
						disabled={textareaIsEmpty}
						onClick={sendMessage}
					>
						send
					</Button>
				</div>
			</div>
			{settingsPanelIsOpen && (
				<SettingsWindow
					windowTitle="Settings"
					settingsWindowVisible={setSettingsPanelIsOpen}
				>
					<Title highlightColor="yellow">Visibility</Title>
					<Button
						baseColor={channelIsPrivate ? [111, 60, 84] : [40, 100, 80]}
						onClick={async () => {
							makePrivate(accessToken, chatId, !channelIsPrivate)
								.then(() => {
									setChannelIsPrivate(!channelIsPrivate);
								})
								.catch((e) => {
									console.error('Could not make private: ', e.message);
								});
						}}
					>
						make {channelIsPrivate ? 'public' : 'private'}
					</Button>
					<Title highlightColor="yellow">Channel password</Title>
					<div className="settings-form">
						<InputField onChange={handlePwdInput}></InputField>
						<Button
							onClick={async () => {
								setNewPassword(accessToken, chatId, pwdContent)
									.then(() => {
										setPwdContent('');
									})
									.catch((e) => {
										console.error('Could not set the password');
									});
							}}
						>
							update
						</Button>
					</div>
				</SettingsWindow>
			)}
		</Window>
	);
};

export default ChatWindow;
