import React, { useContext, useEffect, useRef, useState } from 'react';
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

export interface IMessage {
	sentById: number;
	sentAt: Date;
	content: string;
	login: string;
	avatar: string;
}

const dateFormatOptions: Intl.DateTimeFormatOptions = {
	year: '2-digit',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hour12: true, // Use 24-hour format
};

export interface IChatWindowProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	userId: number;
	chatId: number;
	messages: IMessage[];
}
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
}) => {
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

	useEffect(() => {
		const container = chatContentRef.current;
		if (container) {
			// Make the new messages show up at the bottom
			container.scrollTop = container.scrollHeight;
		}
	}, []); // TODO: this should track the state of the messages passed to the component, so when new messages are added they appear at the bottom of the div

	const openSettingsPanel = () => {
		setSettingsPanelIsOpen(!settingsPanelIsOpen);
	};

	useEffect(() => {
		console.log('messages', messages);
	}, [messages]);

	const { accessToken } = useAuth();

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
		console.log(
			'JSON.stringify({textareaContent, chatId})',
			JSON.stringify({ textareaContent, chatId }),
		);
	};
	return (
		<Window
			windowTitle={`Chat with ${chatId}`}
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
				<div className="chat-content" ref={chatContentRef}>
					{messages.map((currentMessage) => {
						const date: Date = new Date(currentMessage.sentAt);
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
							>
								{currentMessage.content}
							</ChatBubble>
						);
					})}
					<ChattNotification type="Muted" sender="Nikito" recipient="Jee" />
					<ChatGameInvite sender="Jee" recipient="Nikito" />
				</div>
				<div
					className={`chat-input ${
						textareaIsFocused || !textareaIsEmpty ? 'chat-input--focus' : ''
					}`}
				>
					<textarea
						onFocus={() => setTextareaIsFocused(true)}
						onBlur={() => setTextareaIsFocused(false)}
						onChange={handleInputChange}
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
