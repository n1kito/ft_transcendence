import React, { useContext, useEffect, useState } from 'react';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import { UserContext } from '../../../../contexts/UserContext';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import Button from '../../../Shared/Button/Button';
import './GameOverlay.css';

type ReactBooleanSeter = React.Dispatch<React.SetStateAction<boolean>>;

interface IGameOverlayProps {
	connectedToServer: boolean;
	connectionStatus: string;
	userWonGame: boolean;
	userLostGame: boolean;
	player1Ready: boolean;
	player2Ready: boolean;
	playerInRoom: boolean;
	setPlayer1Ready: ReactBooleanSeter;
	opponentInfo?: { login: string; image: string };
	opponentIsReconnecting: boolean;
}

const GameOverlay: React.FC<IGameOverlayProps> = ({
	connectedToServer,
	connectionStatus,
	opponentIsReconnecting,
	userWonGame,
	userLostGame,
	player1Ready,
	player2Ready,
	playerInRoom,
	setPlayer1Ready,
	opponentInfo,
}) => {
	const { userData } = useContext(UserContext);
	const [tooltipVisible, setTooltipVisible] = useState(false);

	return (
		<div className="game-overlay-wrapper">
			{connectedToServer && connectionStatus.length == 0 ? (
				<>
					{(userWonGame || userLostGame) && (
						<div className={`winner-announcement`}>
							WINNER: {userLostGame ? 'NOT ' : ''}YOU
						</div>
					)}
					<div className="game-settings-window-wrapper">
						<div className="game-settings-window-titlebar">Upcoming match</div>
						<div className="game-settings-window-content">
							<FriendBadge
								badgeTitle={userData?.login || '?'}
								badgeImageUrl={userData?.image || undefined}
								onlineIndicator={false}
								isActive={player1Ready}
							/>
							<span>VS</span>
							<FriendBadge
								badgeTitle={opponentInfo?.login || 'Locating...'}
								badgeImageUrl={opponentInfo?.image}
								isClickable={true}
								isActive={player2Ready}
								onlineIndicator={false}
							/>
						</div>
						<p>Your opponent was disconnected</p>
					</div>
					<div
						className="game-play-button-wrapper"
						onMouseEnter={() => {
							setTooltipVisible(true);
						}}
						onMouseLeave={() => {
							setTooltipVisible(false);
						}}
					>
						<Tooltip
							isVisible={tooltipVisible && player1Ready && !player2Ready}
							position="bottom"
						>
							Waiting for your opponent to press "play"
						</Tooltip>
						<Button
							onClick={() => setPlayer1Ready(true)}
							disabled={!playerInRoom || (player1Ready && !player2Ready)}
						>
							play
						</Button>
					</div>
				</>
			) : (
				<>
					{connectionStatus.length > 0 ? (
						<div className={`winner-announcement`}>Oops !</div>
					) : null}
					<span className="game-overlay-status">
						{connectionStatus.length > 0 ? connectionStatus : 'Connecting...'}
					</span>
				</>
			)}
		</div>
	);
};
export default GameOverlay;
