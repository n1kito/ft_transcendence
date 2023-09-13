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

export interface IChatWindowProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	userId: number;
	chatId: number;
	messages: IMessage[];
	setMessages: Dispatch<SetStateAction<IMessage[]>>;
}

export interface IMessage {
	chatId: number;
	sentById: number;
	sentAt: Date;
	content: string;
	login: string;
	avatar?: string;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: true, // Use 24-hour format
};
interface IChatInfo {
	isChannel: boolean;
	isPrivate: boolean;
	isProtected: boolean;
}

const ChatWindow: React.FC<IChatWindowProps> = ({
	userId,
	onCloseClick,
	windowDragConstraintRef,
	chatId,
	messages,
	setMessages,
}) => {
	/* ********************************************************************* */
	/* ******************************* FRONT ******************************* */
	/* ********************************************************************* */

	const [textareaIsFocused, setTextareaIsFocused] = useState(false);
	const [textareaIsEmpty, setTextareaIsEmpty] = useState(true);
	const [textareaContent, setTextareaContent] = useState('');

	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [channelIsPrivate, setChannelIsPrivate] = useState(false);

	const { userData } = useContext(UserContext);
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

	// get the user to the last message
	useEffect(() => {
		const container = chatContentRef.current;
		container?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]); 

	const openSettingsPanel = () => {
		setSettingsPanelIsOpen(!settingsPanelIsOpen);
	};

	// change the login every time the userId changes
	useEffect(() => {
		fetch('api/user/byId/' + userId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.message) console.error('User not Found');
				else setLogin(data.login);
			});
	}, [userId]);

	// empty the textarea when changing active chat
	useEffect(() => {
		setTextareaContent('');
		setTextareaIsEmpty(true);
	}, [userId]);
	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */

	const { accessToken } = useAuth();
	const [login, setLogin] = useState('Anonymous');

	// On mount, join the room associated with the chat
	// TODO: find a way to leave room when changing chat (because it is
	// not an unmounting)
	useEffect(() => {
		console.log('chatId in ChatWindow', chatId);
		if (chatId) userData?.chatSocket?.joinRoom(chatId);
		// return () => {
		// 	userData?.chatSocket?.leaveRoom(chatId);
		// };
	}, [chatId]);

	const sendMessage = async () => {
		console.log('accessToken', accessToken);
		await fetch('/api/chat/sendMessage', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
			credentials: 'include',
			body: JSON.stringify({ message: textareaContent, chatId: chatId }),
		});

		userData?.chatSocket?.sendMessage(
			textareaContent,
			chatId,
			userData.login,
			userData.image,
		);
		console.log(
			' JSON.stringify({ message: textareaContent, chatId: chatId }',
			JSON.stringify({ message: textareaContent, chatId: chatId }),
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
	};

	/* ********************************************************************* */
	/* ******************************* RETURN ****************************** */
	/* ********************************************************************* */

	return (
		<Window
			windowTitle={`Chat with ${login}`}
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			links={[
				{ name: 'Profile', onClick: () => null },
				{ name: 'Play', onClick: () => null },
				{ name: 'Block', onClick: () => null },
				{ name: 'Delete chat', onClick: () => null },
				{ name: 'Settings', onClick: openSettingsPanel },
			]}
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
								wasSent={
									userData && currentMessage.sentById === userData.id
										? true
										: false
								}
								sender={currentMessage.login}
								time={date.toLocaleString('en-US', dateFormatOptions)}
								senderAvatar={currentMessage.avatar}
								isLast={isLast}
								// messageRef={chatContentRef}
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
						onClick={() => setChannelIsPrivate(!channelIsPrivate)}
					>
						make {channelIsPrivate ? 'public' : 'private'}
					</Button>
					<Title highlightColor="yellow">Channel password</Title>
					<div className="settings-form">
						<InputField value="password"></InputField>
						<Button>update</Button>
					</div>
				</SettingsWindow>
			)}
		</Window>
	);
};

export default ChatWindow;
