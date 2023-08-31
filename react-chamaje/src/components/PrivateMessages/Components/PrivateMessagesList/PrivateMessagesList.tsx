import React, { ReactNode } from 'react';
import './PrivateMessagesList.css';

interface IPrivateMessagesListProps {
	children?: ReactNode;
}

const PrivateMessagesList: React.FC<IPrivateMessagesListProps> = ({
	children,
}) => {
	return <div className="private-messages-list-wrapper">{children}</div>;
};

export default PrivateMessagesList;
