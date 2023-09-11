import React, { useContext, useEffect, useState } from 'react';
import './PrivateMessages.css';
import Window from '../Window/Window';
import PrivateMessagesList from './Components/PrivateMessagesList/PrivateMessagesList';
import FriendBadge from '../Friends/Components/FriendBadge/FriendBadge';
import { IFriendStruct } from '../Desktop/Desktop';
import ChatWindow, { IMessage } from '../ChatWindow/ChatWindow';
import useAuth from 'src/hooks/userAuth';
import { UserContext } from 'src/contexts/UserContext';

interface IPrivateMessagesProps {
	onCloseClick: () => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	// chatWindowControl: (state: boolean) => void;
}

export interface IChatStruct {
	chatId: number;
	participants: number[];
}

const PrivateMessages: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
	friends,
	// chatWindowControl,
}) => {
	const chatsList = [''];
	const [chatWindowIsOpen, setChatWindowIsOpen] = useState(false);
	const [chatWindowUserId, setChatWindowUserId] = useState(0);
	const [chatWindowId, setChatWindowId] = useState(0);
	const [chatsJoined, setChatsJoined] = useState<IChatStruct[]>([]);
	const [messages, setMessages] = useState<IMessage[]>([]);
	const { userData, setUserData } = useContext(UserContext);
	const { accessToken } = useAuth();

	async function fetchMessages(chatId: number) {
		fetch('api/chat/chatMessages/' + chatId, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setMessages(data);
			});
	}

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
				const updatedUserData = {
					...userData,
					id: userData?.id,
					login: userData?.login || '',
					email: userData?.email || '',
					friends: userData?.friends || [],
					chatSocket: userData?.chatSocket || null,
					image: userData?.image || '',
					chatsJoined: chatsJoined,
				};
				setUserData(updatedUserData);
			});
	}, []);
	useEffect(() => {
		console.log('messages', messages);
	}, [messages]);
	useEffect(() => {
		console.log('chatsJoined', chatsJoined);
	}, [chatsJoined]);

	useEffect(() => {
		console.log('chatWindowId', chatWindowId);
	}, [chatWindowId]);

	// on click on an avatar, check if a PM conversation exists.
	// If it does, open the window, set the userId and chatId, and fetch
	// the messages.
	// Otherwise open clean the messages and open the window
	const openPrivateMessageWindow: any = (friendId: number) => {
		let foundChat = false;
		const chatId = chatsJoined.map((currentChat) => {
			console.log('currentChat', currentChat);
			if (
				currentChat.participants.length === 2 &&
				(currentChat.participants.at(0) === friendId ||
					currentChat.participants.at(1) === friendId)
			) {
				console.log('found a corresponding chat', currentChat);
				setChatWindowId(currentChat.chatId);
				fetchMessages(currentChat.chatId);
				foundChat = true;
				return;
			}
		});
		setChatWindowIsOpen(true);
		setChatWindowUserId(friendId);
		// TODO: this should create a new chat with the user
		if (!foundChat && !chatWindowId) {
			fetch('api/chat/createChatPrivateMessage/' + friendId, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
				},
				credentials: 'include',
				body: JSON.stringify({
					isChannel: false,
					isPrivate: true,
					isProtected: false,
					userId: friendId,
				}),
			})
				.then((response) => response.json())
				.then((data) => {
					setChatWindowId(data);
					setMessages([]);
				});
			console.error('This chat does not exist');
		}
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
					chatId={chatWindowId}
					messages={messages}
				/>
			)}
		</>
	);
};

export default PrivateMessages;
