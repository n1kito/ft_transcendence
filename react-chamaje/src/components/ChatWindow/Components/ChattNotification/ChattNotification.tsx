import React from 'react';
import './ChattNotification.css';
import Title from '../../../Profile/Components/Title/Title';

interface IChatNotificationProps {
	type: string;
	sender: string | undefined;
	recipient: string | undefined;
}

const ChattNotification: React.FC<IChatNotificationProps> = ({
	type,
	sender,
	recipient,
}) => {
	return (
		<div className="chat-notification-wrapper">
			<Title>{`@${recipient} was ${type.toLowerCase()} for 15 minutes`}</Title>
		</div>
	);
};

export default ChattNotification;
