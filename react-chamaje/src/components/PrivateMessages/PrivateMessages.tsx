import React from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { IFriendStruct } from '../Desktop/Desktop';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	chatWindowControl: (state: boolean) => void;
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	chatWindowControl,
}) => {
	const chatsList = [''];

	const openPrivateMessageWindow: any = (friendId: number) => {
		console.log(friendId);
		chatWindowControl(true);
	};
	return (
		<Window
			windowTitle="Private Messages"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="private-messages-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<PrivateMessagesList>
				{chatsList.length > 0 ? (
					friends.map((friend, index) => (
						// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
						<FriendBadge
							key={index}
							badgeTitle={friend.login}
							badgeImageUrl={`http://localhost:3000${friend.image}`}
							onlineIndicator={friend.onlineStatus}
							isClickable={true}
							onClick={() => {
								openPrivateMessageWindow(friend.id);
							}}
						/>
					))
				) : (
					<FriendBadge isEmptyBadge={true} isChannelBadge={false} />
				)}
			</PrivateMessagesList>
		</Window>
	);
};

export default PrivateMessages;
