import React from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';

export interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	const chatsList = [''];

	return (
		<Window
			initialWindowPosition={{ top: 25, left: 25 }}
			windowTitle="Private Messages"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="private-messages-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<PrivateMessagesList>
				{chatsList.length > 0 ? (
					<>
						<FriendBadge isClickable={true} badgeTitle="Norminet" />
						<FriendBadge isClickable={true} />
						<FriendBadge isClickable={true} />
					</>
				) : (
					<FriendBadge isEmptyBadge={true} isChannelBadge={false} />
				)}
			</PrivateMessagesList>
		</Window>
	);
};

export default PrivateMessages;
