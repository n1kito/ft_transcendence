import React, { ReactNode, useContext, RefObject, useState } from 'react';
import './ChatBubble.css';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import Button from '../../../Shared/Button/Button';
import Profile from 'src/components/Profile/Profile';
import { ban, kick, makeAdmin, mute } from 'src/utils/queries';
import useAuth from 'src/hooks/userAuth';
import { access } from 'fs';
import { ChatContext } from 'src/contexts/ChatContext';
import { useDragControls } from 'framer-motion';
import { UserContext } from 'src/contexts/UserContext';

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
	const { chatData } = useContext(ChatContext);
	const { userData } = useContext(UserContext);
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
										// socket
										mute(accessToken, chatId, userId)
											.then((data) => {
												console.log(data);
												chatData.socket?.sendMessage(
													'',
													chatId,
													userData ? userData?.login : '',
													'',
													'mute',
													userId,
													sender,
												);
											})
											.catch((e) => {
												console.error('Could not mute user: ', e.message);
											});
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
												chatData.socket?.kick(userId, chatId);
												chatData.socket?.sendMessage(
													'',
													chatId,
													userData ? userData?.login : '',
													'',
													'kick',
													userId,
													sender,
												);
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
										// socket
										ban(accessToken, chatId, userId)
											.then((data) => {
												console.log(data);
												chatData.socket?.kick(userId, chatId);
												chatData.socket?.sendMessage(
													'',
													chatId,
													userData ? userData?.login : '',
													'',
													'ban',
													userId,
													sender,
												);
											})
											.catch((e) => {
												console.error('Could not ban user: ', e.message);
											});
									}}
								>
									ban
								</Button>
								<Button
									baseColor={[111, 60, 84]}
									onClick={() => {
										// socket => make admin
										makeAdmin(accessToken, chatId, userId)
											.then((data) => {
												console.log(data);
												chatData.socket?.makeAdmin(userId, chatId);
												chatData.socket?.sendMessage(
													'',
													chatId,
													userData ? userData?.login : '',
													'',
													'admin',
													userId,
													sender,
												);
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
