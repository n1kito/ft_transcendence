import React, { useContext, useEffect } from 'react';
import './GameOverlay.css';
import GameSelectionScreen from './Components/GameSelectionScreen/GameSelectionScreen';
import GameErrorScreen from './Components/GameErrorScreen/GameErrorScreen';
import GameOpponentDisconnectScreen from './Components/GameDisconnectScreen/GameOpponentDisconnectScreen';
import { GameContext } from '../../../../contexts/GameContext';

const GameOverlay = () => {
	const { gameData } = useContext(GameContext);

	return (
		<div className="game-overlay-wrapper">
			{gameData.connectedToServer &&
				!gameData.opponentIsReconnecting &&
				!gameData.gameIsPlaying &&
				!gameData.connectionErrorStatus && <GameSelectionScreen />}
			{(!gameData.connectedToServer || gameData.connectionErrorStatus) &&
				!gameData.opponentIsReconnecting && <GameErrorScreen />}
			{gameData.connectedToServer && gameData.opponentIsReconnecting && (
				<GameOpponentDisconnectScreen />
			)}
		</div>
	);
};
export default GameOverlay;
