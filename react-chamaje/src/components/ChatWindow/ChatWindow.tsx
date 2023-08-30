import React, { useContext, useEffect, useRef } from 'react';
import './ChatWindow.css';
import Window from '../Window/Window';
import Button from '../Shared/Button/Button';
import ChatBubble from './Components/ChatBubble/ChatBubble';
import { UserContext } from '../../contexts/UserContext';
import ChattNotification from './Components/ChattNotification/ChattNotification';
import ChatGameInvite from './Components/ChatGameInvite/ChatGameInvite';

export interface IChatWindowProps {
	login: string;
}

const ChatWindow: React.FC<IChatWindowProps> = ({ login }) => {
	// TODO: remove this
	const doNothing = () => {};
	const { userData } = useContext(UserContext);
	const chatContentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = chatContentRef.current;
		if (container) {
			// Make the new messages show up at the bottom
			container.scrollTop = container.scrollHeight;
		}
	}, []); // TODO: this should track the state of the messages passed to the component, so when new messages are added they appear at the bottom of the div

	return (
		<Window
			windowTitle={`Chat with ${login}`}
			onCloseClick={() => doNothing()}
			links={[
				{ name: 'Profile', url: '#' },
				{ name: 'Play', url: '#' },
				{ name: 'Block', url: '#' },
				{ name: 'Delete chat', url: '#' },
			]}
			useBeigeBackground={true}
		>
			<div className="chat-wrapper">
				<div className="chat-content" ref={chatContentRef}>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatBubble
						wasSent={true}
						sender="Nikito"
						time="24/09/1992 - 11:11 PM"
					>
						Bah t'es qui alors
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Tu parles mieux déjà
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChattNotification type="Muted" sender="Nikito" recipient="Jee" />
					<ChatBubble
						sender="Jee"
						time="24/09/1992 - 11:11 PM"
						senderAvatar="https://cdnb.artstation.com/p/assets/images/images/059/395/601/large/liqudiv-zhan-liqudiv-midjourney-ai-overpaint-web-20220605-2.jpg?1676302872"
					>
						Salut, c’est pas Jee !
					</ChatBubble>
					<ChatGameInvite sender="Jee" recipient="Nikito" />
					<ChatBubble
						wasSent={true}
						sender={userData?.login}
						time="24/09/1992 - 11:11 PM"
					>
						Je suis très mal à l'aise
					</ChatBubble>
				</div>
				<div className="chat-input">
					<textarea></textarea>
					<Button baseColor={[151, 51, 91]}>send</Button>
				</div>
			</div>
		</Window>
	);
};

export default ChatWindow;
