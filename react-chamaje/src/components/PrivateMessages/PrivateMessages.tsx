import React, { useEffect, useState } from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { IFriendStruct } from '../Desktop/Desktop';
import ChatWindow from '../ChatWindow/ChatWindow';
import useAuth from 'src/hooks/userAuth';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	// chatWindowControl: (state: boolean) => void;
}

// export interface IChatStruct {
// 	chatId: number;
// }

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	// chatWindowControl,
}) => {
	const chatsList = [''];
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowUserId, setChatWindowUserId] = useState(0);
	const [chatsJoined, setChatsJoined] = useState([]);
	const { accessToken } = useAuth();

	// on mounting this component, fetch the chatsJoined
	useEffect(() => {
		fetch('/api/user/me/chatsJoined', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setChatsJoined(data);
			});
	}, []);

	const openPrivateMessageWindow: any = (friendId: number) => {
		const chatId = chatsJoined.map((currentMap) => {
			chatsJoined.Chat.
		})
		console.log(friendId);
		setChatWindowIsOpen(true);
		setChatWindowUserId(friendId);
	};
	return (
		<>
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
			{chatWindowIsOpen && (
				<ChatWindow
					onCloseClick={() => setChatWindowIsOpen(false)}
					windowDragConstraintRef={windowDragConstraintRef}
					userId={chatWindowUserId}
				/>
			)}
		</>
	);
};

export default PrivateMessages;
