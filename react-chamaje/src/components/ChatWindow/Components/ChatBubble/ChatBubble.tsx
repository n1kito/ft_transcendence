import React, { ReactNode } from 'react';
import './ChatBubble.css';

interface IChatBubbleProps {
	wasSent?: boolean;
	sender?: string;
	senderAvatar?: string;
	time?: string;
	children: ReactNode;
}

const ChatBubble: React.FC<IChatBubbleProps> = ({
	wasSent = false,
	sender = 'Sender',
	time = '',
	senderAvatar = '',
	children,
}) => {
	const openFriendProfile = () => {
		window.alert(`This should open ${sender}'s profile`);
	};
	return (
		<div
			className={`chat-bubble-wrapper ${wasSent ? 'bubble-align-right' : ''}`}
		>
			{!wasSent && (
				<img
					src={senderAvatar}
					draggable={false}
					onClick={() => openFriendProfile()}
				/>
			)}
			<div className={`chat-bubble-content ${wasSent ? 'green-bubble' : ''}`}>
				<span className="chat-bubble-info">{`@${sender} – 11:11 PM`}</span>
				{children}
			</div>
		</div>
	);
};

export default ChatBubble;
