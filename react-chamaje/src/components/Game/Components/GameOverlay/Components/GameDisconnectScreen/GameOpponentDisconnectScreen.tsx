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
	const { gameData, updateGameData, resetGameData } = useContext(GameContext);
	const [waitTime, setWaitTime] = useState(10);
	const [userWantToLeave, setUserWantsToLeave] = useState(false);
	const [tooltipVisible, setTooltipVisible] = useState(false);

	useEffect(() => {
		if (waitTime == 0) {
			// TODO: not sure this is necessary since the server sends an update
			// when a player who disconnected is not coming back
			// updateGameData({
			// 	opponentIsReconnecting: false,
			// 	opponentInfo: undefined,
			// 	roomIsFull: false,
			// 	player2Ready: false,
			// 	gameIsPlaying: false,
			// });
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
				{`${gameData.opponentInfo?.login || 'Opponent'}`} left :(
			</GameScreenTitle>
			<span className="game-opponent-disconnect-message">
				let's wait a bit and see if they come back shall we ? ({waitTime})<br />
				game will start over
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
