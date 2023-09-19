import React, { ReactNode, RefObject, useState } from 'react';
import './ChatBubble.css';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import Button from '../../../Shared/Button/Button';
import Profile from 'src/components/Profile/Profile';

interface IChatBubbleProps {
	userId: number;
	wasSent?: boolean;
	sender?: string;
	senderAvatar?: string;
	time?: string;
	children: ReactNode;
	// messageRef?: RefObject<HTMLDivElement>;
}

const ChatBubble: React.FC<IChatBubbleProps> = ({
	wasSent = false,
	sender = 'Sender',
	time = '',
	senderAvatar = '',
	children,
	// messageRef,
}) => {
	const [tooltipVisible, setTooltipVisible] = useState(false);
	const [profileIsOpen, setProfileIsOpen] = useState(false);

	const openFriendProfile = () => {
		setProfileIsOpen(true)
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
							setTooltipVisible(true);
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
										window.alert('user was kicked');
									}}
								>
									kick
								</Button>
								<Button
									baseColor={[309, 81, 92]}
									onClick={() => {
										window.alert('user is blocked');
									}}
								>
									block
								</Button>
								<Button
									baseColor={[111, 60, 84]}
									disabled={true}
									onClick={() => {
										window.alert('user is now an admin');
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
