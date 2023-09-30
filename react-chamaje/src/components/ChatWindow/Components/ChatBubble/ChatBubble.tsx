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
import { useNavigationParams } from 'src/hooks/useNavigationParams';

interface IChatBubbleProps {
	userId: number;
	chatId: number;
	wasSent?: boolean;
	sender?: string;
	senderAvatar?: string;
	time?: string;
	children: ReactNode;
	isAdmin: boolean;
	setShowFriendProfile: React.Dispatch<React.SetStateAction<boolean>>;
	setProfileLogin: React.Dispatch<React.SetStateAction<string>>;
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
	setShowFriendProfile,
	setProfileLogin,
	// messageRef,
}) => {
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [profileIsOpen, setProfileIsOpen] = useState(false);
	const { chatData } = useContext(ChatContext);
	const { userData } = useContext(UserContext);
	const { accessToken } = useAuth();
	// Navigation hook
	const { setNavParam } = useNavigationParams();

	const openFriendProfile = () => {
		if (sender === 'anonymous') return;
		setNavParam('friendProfile', sender);
		setShowFriendProfile(true);
		setProfileIsOpen(true);
		setProfileLogin(sender);
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
											.then(() => {
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
											.catch((e) => {});
									}}
								>
									mute
								</Button>
								<Button
									onClick={() => {
										// chatData.socket => send kick message
										kick(accessToken, chatId, userId)
											.then(() => {
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
											.catch((e) => {});
									}}
								>
									kick
								</Button>
								<Button
									baseColor={[309, 81, 92]}
									onClick={() => {
										// socket
										ban(accessToken, chatId, userId)
											.then(() => {
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
											.catch((e) => {});
									}}
								>
									ban
								</Button>
								<Button
									baseColor={[111, 60, 84]}
									onClick={() => {
										// socket => make admin
										makeAdmin(accessToken, chatId, userId)
											.then(() => {
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
											.catch((e) => {});
									}}
								>
									admin
								</Button>
							</div>
						</Tooltip>
					</div>
				)}
				<div className={`chat-bubble-content ${wasSent ? 'green-bubble' : ''}`}>
					<span className="chat-bubble-info">{`@${sender} – ${time}`}</span>
					<div className="chat-bubble-message">{children}</div>
				</div>
			</div>
			{/* {profileIsOpen && <Profile login={sender} onCloseClick={() => setProfileIsOpen(false)} windowDragConstraintRef={}/>} */}
		</>
	);
};

export default ChatBubble;
