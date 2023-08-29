import React from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';

export interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	return (
		<Window
			windowTitle="Private Messages"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="private-messages-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<PrivateMessagesList />
		</Window>
	);
};

export default PrivateMessages;
