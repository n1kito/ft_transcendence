import React, { useState } from 'react';
import './ChatGameInvite.css';
import Title from '../../../Profile/Components/Title/Title';
import Button from '../../../Shared/Button/Button';

interface IGameInviteProps {
	sender: string | undefined;
	recipient: string | undefined;
}

const ChatGameInvite: React.FC<IGameInviteProps> = ({ sender, recipient }) => {
	const [inviteDeclined, setInviteDeclined] = useState(false);
	const [inviteAccepted, setInviteAccepted] = useState(false);

	const acceptInvite = () => {
		setInviteAccepted(true);
	};
	const declineInvite = () => {
		setInviteDeclined(true);
	};

	return (
		<div
			className={`game-invite-wrapper ${
				(inviteDeclined || inviteAccepted) && 'invite-declined'
			}`}
		>
			{inviteAccepted ? (
				<Title>{`You accepted to play pong with @${sender} :)`}</Title>
			) : inviteDeclined ? (
				<Title>{`You declined ${sender}'s pong invite :(`}</Title>
			) : (
				<Title>{`@${sender} invites you to play pong !`}</Title>
			)}

			{!inviteDeclined && !inviteAccepted && (
				<div className="invite-buttons">
					<Button baseColor={[151, 51, 91]} onClick={() => acceptInvite()}>
						yes
					</Button>
					<Button baseColor={[308, 80, 92]} onClick={() => declineInvite()}>
						no
					</Button>
				</div>
			)}
		</div>
	);
};

export default ChatGameInvite;
