import React, { useContext, useEffect, useState } from 'react';
import './GameOpponentDisconnectScreen.css';
import { GameContext } from '../../../../../../contexts/GameContext';
import GameScreenTitle from '../Shared/GameScreenTitle/GameScreenTitle';
import Button from '../../../../../Shared/Button/Button';
import Tooltip from '../../../../../Shared/Tooltip/Tooltip';

interface IOpponentDisconnectScreenProps {}

const GameOpponentDisconnectScreen: React.FC<
	IOpponentDisconnectScreenProps
> = () => {
	const { gameData, updateGameData } = useContext(GameContext);
	const [waitTime, setWaitTime] = useState(5);
	const [userWantToLeave, setUserWantsToLeave] = useState(false);
	const [tooltipVisible, setTooltipVisible] = useState(false);

	useEffect(() => {
		if (waitTime == 0) {
			updateGameData({
				opponentIsReconnecting: false,
				opponentInfo: undefined,
			});
			console.log('Opponent is no longer reconnecting');
			return;
		}
		setTimeout(() => {
			setWaitTime(waitTime - 1);
		}, 1000);
	}, [waitTime]);

	if (userWantToLeave) return null;
	return (
		<>
			<GameScreenTitle>
				{`${gameData.opponentInfo?.login || 'Opponent'}`} left :(
			</GameScreenTitle>
			<span className="game-opponent-disconnect-message">
				let's wait a bit and see if they come back shall we ? ({waitTime})
			</span>
			<div
				className="game-opponent-disconnect-button"
				onMouseEnter={() => setTooltipVisible(true)}
				onMouseLeave={() => setTooltipVisible(false)}
			>
				<Tooltip isVisible={tooltipVisible} position="bottom">
					Ask to be paired with someone else
				</Tooltip>
				<Button onClick={() => setUserWantsToLeave(true)}>no thanks</Button>
			</div>
		</>
	);
};

export default GameOpponentDisconnectScreen;
