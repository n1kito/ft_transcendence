import React from 'react';
import './ChatNotification.css';
import Title from '../../../Profile/Components/Title/Title';

interface IChatNotificationProps {
	type: string;
	sender: string | undefined;
	recipient: string | undefined;
	channelName?: string | undefined;
}

const ChatNotification: React.FC<IChatNotificationProps> = ({
	type,
	sender,
	recipient,
	channelName,
}) => {
	return (
		<div className="chat-notification-wrapper">
			{type === 'mute' ? (
				<Title>{`@${recipient} was muted for 15 minutes`}</Title>
			) : type === 'invite' ? (
				<Title>{`@${sender} invited you to join ${channelName} channel`}</Title>
			) : type === 'ban' ? (
				<Title>{`@${recipient} was banned by ${sender}`}</Title>
			) : type === 'kick' ? (
				<Title>{`@${recipient} was kicked by ${sender}`}</Title>
			) : (
				<Title>{`@${recipient} is now an administrator`}</Title>
			)}
		</div>
	);
};

export default ChatNotification;
