import React, { useContext, useState } from 'react';
import { GameContext } from '../../../../../../contexts/GameContext';
import './GameSelectionScreen.css';
import FriendBadge from '../../../../../Friends/Components/FriendBadge/FriendBadge';
import { UserContext } from '../../../../../../contexts/UserContext';
import Tooltip from '../../../../../Shared/Tooltip/Tooltip';
import Button from '../../../../../Shared/Button/Button';
import GameScreenTitle from '../Shared/GameScreenTitle/GameScreenTitle';
import GameLocatingBadge from './Components/GameLocatingBadge';

interface IGameSelectionScreenProps {}

const GameSelectionScreen: React.FC<IGameSelectionScreenProps> = () => {
	const { gameData, updateGameData } = useContext(GameContext);
	const { userData } = useContext(UserContext);
	const [playTooltipVisible, setPlayTooltipVisible] = useState(false);
	const [powerupsTooltipVisible, setPowerupsTooltipVisible] = useState(false);
	const [shuffleTooltipVisible, setShuffleTooltipVisible] = useState(false);

	return (
		<>
			{(gameData.userWonGame || gameData.userLostGame) && (
				<GameScreenTitle>
					WINNER: {gameData.userLostGame ? 'NOT ' : ''}YOU
				</GameScreenTitle>
			)}
			<div className="game-selection-screen-window-wrapper">
				<div className="game-selection-screen-window-titlebar">
					{gameData.opponentInfo ? 'Upcoming match' : 'Locating opponent...'}
				</div>
				<div className="game-selection-screen-window-content">
					<FriendBadge
						badgeTitle={userData?.login || '?'}
						badgeImageUrl={userData?.image || undefined}
						onlineIndicator={false}
						isActive={gameData.player1Ready}
					/>
					<span>VS</span>
					{gameData.opponentInfo ? (
						<FriendBadge
							badgeTitle={gameData.opponentInfo.login}
							badgeImageUrl={gameData.opponentInfo.image}
							isClickable={true}
							isActive={gameData.player2Ready}
							onlineIndicator={true}
						/>
					) : (
						<GameLocatingBadge />
					)}
				</div>
			</div>
			<div className="game-selection-screen-buttons">
				<div
					className="game-play-button-wrapper"
					onMouseEnter={() => {
						setPlayTooltipVisible(true);
					}}
					onMouseLeave={() => {
						setPlayTooltipVisible(false);
					}}
				>
					<Tooltip
						isVisible={
							playTooltipVisible &&
							gameData.player1Ready &&
							!gameData.player2Ready
						}
						position="bottom"
					>
						Waiting for your opponent to press "play"
					</Tooltip>
					<Button
						onClick={() => updateGameData({ player1Ready: true })}
						disabled={
							!gameData.opponentInfo ||
							(gameData.player1Ready && !gameData.player2Ready)
						}
					>
						play
					</Button>
				</div>
				<div
					className="game-play-button-wrapper"
					onMouseEnter={() => {
						setPowerupsTooltipVisible(true);
					}}
					onMouseLeave={() => {
						setPowerupsTooltipVisible(false);
					}}
				>
					<Tooltip
						isVisible={
							powerupsTooltipVisible && gameData.opponentInfo != undefined
						}
						position="bottom"
					>
						{`${
							gameData.opponentPowerupsDisabled
								? 'Your opponent disabled power-ups. Destroy them.'
								: gameData.userPowerupsDisabled
								? 'You disabled the power-ups ? Ok fine.'
								: 'Power-ups are activated ! Yay !'
						}`}
					</Tooltip>
					<Button
						onClick={() => {
							updateGameData({
								userPowerupsDisabled: !gameData.userPowerupsDisabled,
							});
						}}
						disabled={
							gameData.player1Ready ||
							gameData.player2Ready ||
							!gameData.opponentInfo ||
							gameData.opponentPowerupsDisabled
						}
						baseColor={
							gameData.userPowerupsDisabled ? [360, 75, 80] : [200, 70, 90]
						}
					>
						✨ power-ups
						{gameData.userPowerupsDisabled || gameData.opponentPowerupsDisabled
							? ' ✗'
							: ' ✔'}
					</Button>
				</div>
				<div
					className="game-play-button-wrapper"
					onMouseEnter={() => {
						setShuffleTooltipVisible(true);
					}}
					onMouseLeave={() => {
						setShuffleTooltipVisible(false);
					}}
				>
					<Tooltip
						isVisible={
							shuffleTooltipVisible &&
							!gameData.player1Ready &&
							gameData.opponentInfo != undefined
						}
						position="bottom"
					>
						Try to find another opponent ?
					</Tooltip>
					<Button
						onClick={() => {
							updateGameData({ userWantsNewOpponent: true });
						}}
						disabled={gameData.player1Ready || !gameData.opponentInfo}
						baseColor={[300, 91, 84]}
					>
						shuffle
					</Button>
				</div>
			</div>
		</>
	);
};

export default GameSelectionScreen;
