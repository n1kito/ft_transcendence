import React, { useContext, useEffect, useState } from 'react';
import './GameOpponentDisconnectScreen.css';
import { GameContext } from '../../../../../../contexts/GameContext';
import GameScreenTitle from '../Shared/GameScreenTitle/GameScreenTitle';
import Button from '../../../../../Shared/Button/Button';
import Tooltip from '../../../../../Shared/Tooltip/Tooltip';

const GameOpponentDisconnectScreen = () => {
	const { gameData, resetGameData } = useContext(GameContext);
	const [waitTime, setWaitTime] = useState(10);
	const [tooltipVisible, setTooltipVisible] = useState(false);

	useEffect(() => {
		if (waitTime == 0) {
			console.log('Not waiting for reconnection anymore');
			resetGameData();
			return;
		}
		setTimeout(() => {
			setWaitTime(waitTime - 1);
		}, 1000);
	}, [waitTime]);

	return (
		<>
			<GameScreenTitle>
				{`${gameData.opponentInfo?.login || 'Opponent'}`} left :
			</GameScreenTitle>
			<span className="game-opponent-disconnect-message">
				{`let's wait a bit and see if they come back shall we ? ({waitTime})<br />
				game will start over`}
			</span>
			<div
				className="game-opponent-disconnect-button"
				onMouseEnter={() => setTooltipVisible(true)}
				onMouseLeave={() => setTooltipVisible(false)}
			>
				<Tooltip isVisible={tooltipVisible} position="bottom">
					Ask to be paired with someone else
				</Tooltip>
				<Button onClick={() => resetGameData()}>no thanks</Button>
			</div>
		</>
	);
};

export default GameOpponentDisconnectScreen;
