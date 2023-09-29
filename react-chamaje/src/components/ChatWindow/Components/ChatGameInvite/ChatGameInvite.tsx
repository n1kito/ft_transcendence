import React, { useContext, useEffect, useState } from 'react';
import './ChatGameInvite.css';
import Title from '../../../Profile/Components/Title/Title';
import Button from '../../../Shared/Button/Button';
import { UserContext } from 'src/contexts/UserContext';
import { setInviteReply } from 'src/utils/queries';
import useAuth from 'src/hooks/userAuth';
import { GameContext } from 'src/contexts/GameContext';
import { ChatContext } from 'src/contexts/ChatContext';
import { useNavigationParams } from 'src/hooks/useNavigationParams';

interface IGameInviteProps {
	chatId: number;
	sender: string | undefined;
	recipient: string | undefined;
	sentAt: Date;
	reply?: boolean;
}

const ChatGameInvite: React.FC<IGameInviteProps> = ({
	chatId,
	sender,
	recipient,
	sentAt,
	reply = undefined,
}) => {
	const [inviteDeclined, setInviteDeclined] = useState(false);
	const [inviteAccepted, setInviteAccepted] = useState(false);
	const { userData } = useContext(UserContext);
	const { accessToken } = useAuth();
	const { updateGameData } = useContext(GameContext);
	const { chatData } = useContext(ChatContext);
	const { setNavParam } = useNavigationParams();

	// const

	const acceptInvite = () => {
		setInviteReply(chatId, true, accessToken)
			.then(() => {
				setInviteAccepted(true);
				chatData.socket?.sendAcceptInvite(sender || '', chatId);
			})
			.catch((e) => {});

		// TODO: fix ?
		// open a game window
		updateGameData({ opponentInfo: { login: sender || '', image: '' } });
		setNavParam('game');
		// setGameWindowIsOpen(true);
	};
	const declineInvite = () => {
		setInviteReply(chatId, false, accessToken)
			.then(() => {
				setInviteDeclined(true);
				chatData.socket?.sendDeclineInvite(sender || '', chatId);
			})
			.catch((e) => {});
	};

	useEffect(() => {
		setInviteAccepted(reply || false);
		setInviteDeclined(reply === undefined || reply === null ? false : !reply);
		// set the invitation to declined if it has been more than 15minutes
		let sentAtDate = new Date(sentAt);
		sentAtDate.setMinutes(sentAtDate.getMinutes() + 15);
		const nowDate = new Date();
		if (sentAtDate < nowDate && (reply === undefined || reply === null)) {
			setInviteDeclined(true);
		}
	}, []);

	return (
		<div
			className={`game-invite-wrapper ${
				(inviteDeclined || inviteAccepted) && 'invite-declined'
			}`}
		>
			{sender === userData?.login ? (
				inviteAccepted ? (
					<Title>{`${recipient} accepted to play pong with you :)`}</Title>
				) : inviteDeclined ? (
					<Title>{`${recipient} declined your pong invite :(`}</Title>
				) : (
					<Title>{`You invited ${recipient} to play pong !`}</Title>
				)
			) : inviteAccepted ? (
				<Title>{`You accepted to play pong with ${sender} :)`}</Title>
			) : inviteDeclined ? (
				<Title>{`You declined ${sender}s' pong invite :(`}</Title>
			) : (
				<Title>{`${sender} invites you to play pong !`}</Title>
			)}

			{!inviteAccepted && !inviteDeclined && sender !== userData?.login && (
				// {!inviteDeclined && !inviteAccepted && sender !== userData?.login && (
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
