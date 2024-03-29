import React, { useContext, useState } from 'react';
import { useNavigationParams } from 'src/hooks/useNavigationParams';
import { GameContext } from '../../../../../../contexts/GameContext';
import { UserContext } from '../../../../../../contexts/UserContext';
import FriendBadge from '../../../../../Friends/Components/FriendBadge/FriendBadge';
import Button from '../../../../../Shared/Button/Button';
import Tooltip from '../../../../../Shared/Tooltip/Tooltip';
import GameScreenTitle from '../Shared/GameScreenTitle/GameScreenTitle';
import GameLocatingBadge from './Components/GameLocatingBadge';
import './GameSelectionScreen.css';

const GameSelectionScreen = () => {
	const { gameData, updateGameData } = useContext(GameContext);
	const { userData } = useContext(UserContext);
	const [playTooltipVisible, setPlayTooltipVisible] = useState(false);
	const [powerupsTooltipVisible, setPowerupsTooltipVisible] = useState(false);
	const [shuffleTooltipVisible, setShuffleTooltipVisible] = useState(false);
	const { setNavParam } = useNavigationParams();

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
							badgeImageUrl={`/api/images/${gameData.opponentInfo.image}`}
							isClickable={true}
							onClick={() => {
								setNavParam('friendProfile', gameData.opponentInfo?.login);
							}}
							isActive={gameData.player2Ready}
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
						Waiting for your opponent to press PLAY
					</Tooltip>
					<Button
						onClick={() => updateGameData({ player1Ready: true })}
						disabled={
							!gameData.opponentInfo?.playerIsInTheRoom ||
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
						disabled={/*gameData.player1Ready || */ !gameData.opponentInfo}
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
