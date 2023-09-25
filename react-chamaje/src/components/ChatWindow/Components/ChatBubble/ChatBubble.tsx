import React, { ReactNode, RefObject, useState } from 'react';
import './ChatBubble.css';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import Button from '../../../Shared/Button/Button';
import Profile from 'src/components/Profile/Profile';
import { kick, makeAdmin } from 'src/utils/queries';
import useAuth from 'src/hooks/userAuth';
import { access } from 'fs';

interface IChatBubbleProps {
	userId: number;
	chatId: number;
	wasSent?: boolean;
	sender?: string;
	senderAvatar?: string;
	time?: string;
	children: ReactNode;
	isAdmin: boolean;
	// messageRef?: RefObject<HTMLDivElement>;
}

const ChatBubble: React.FC<IChatBubbleProps> = ({
	chatId,
	userId,
	wasSent = false,
	sender = 'Sender',
	time = '',
	senderAvatar = '',
	children,
	isAdmin = false,
	// messageRef,
}) => {
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [profileIsOpen, setProfileIsOpen] = useState(false);
	const { accessToken } = useAuth();

	const openFriendProfile = () => {
		setProfileIsOpen(true);
		window.alert(`This should open ${sender}'s profile`);
	};

	// if (isLast) {
	// 	console.warn('isLast was true, messageRef=', messageRef);
	// }
	return (
		<>
			<div
				className={`chat-bubble-wrapper ${wasSent ? 'bubble-align-right' : ''}`}
				// ref={messageRef}
			>
				{!wasSent && (
					<div
						className="chat-bubble-avatar"
						onMouseEnter={() => {
							if (isAdmin) setTooltipVisible(true);
						}}
						onMouseLeave={() => {
							setTimeout(() => {
								setTooltipVisible(false);
							}, 200);
						}}
					>
						<img
							src={senderAvatar}
							draggable={false}
							onClick={() => openFriendProfile()}
						/>
						<Tooltip isVisible={tooltipVisible} position="right">
							<div className="chat-bubble-tooltip-content">
								<Button
									baseColor={[201, 72, 89]}
									onClick={() => {
										window.alert(
											'user is muted for 15 minutes. Each click adds 15 minutes up to an hour.',
										);
									}}
								>
									mute
								</Button>
								<Button
									onClick={() => {
										// chatData.socket => send kick message
										kick(accessToken, chatId, userId)
											.then((data) => {
												console.log(data);
											})
											.catch((e) => {
												console.error('Could not kick user: ', e.message);
											});
									}}
								>
									kick
								</Button>
								<Button
									baseColor={[309, 81, 92]}
									onClick={() => {
										window.alert('user was banned');
									}}
								>
									ban
								</Button>
								<Button
									baseColor={[111, 60, 84]}
									onClick={() => {
										// socket => make admin
										// make admin query
										makeAdmin(accessToken, chatId, userId)
											.then((data) => {
												console.log(data);
											})
											.catch((e) => {
												console.error(
													'Could not make the user administrator: ',
													e.message,
												);
											});
									}}
								>
									admin
								</Button>
							</div>
						</Tooltip>
					</div>
				)}
				<div className={`chat-bubble-content ${wasSent ? 'green-bubble' : ''}`}>
					<span className="chat-bubble-info">{`@${sender} – ${time}`}</span>
					{children}
				</div>
			</div>
			{/* {profileIsOpen && <Profile login={sender} onCloseClick={() => setProfileIsOpen(false)} windowDragConstraintRef={}/>} */}
		</>
	);
};

export default ChatBubble;
