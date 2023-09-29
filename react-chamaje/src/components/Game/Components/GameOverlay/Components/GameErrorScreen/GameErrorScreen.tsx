import React, { useContext } from 'react';
import { GameContext } from '../../../../../../contexts/GameContext';
import './GameErrorScreen.css';
import GameScreenTitle from '../Shared/GameScreenTitle/GameScreenTitle';

const GameErrorScreen = () => {
	const { gameData } = useContext(GameContext);

	return (
		<>
			<GameScreenTitle>
				{gameData.connectionErrorStatus ? 'Oops !' : 'Please wait'}{' '}
			</GameScreenTitle>
			<span className="game-connection-error-status">
				{gameData.connectionErrorStatus
					? gameData.connectionErrorStatus
					: 'Connecting...'}
			</span>
		</>
	);
};

export default GameErrorScreen;
