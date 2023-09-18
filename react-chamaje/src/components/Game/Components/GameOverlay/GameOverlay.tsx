import React, { useContext, useEffect, useState } from 'react';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import { UserContext } from '../../../../contexts/UserContext';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import Button from '../../../Shared/Button/Button';
import './GameOverlay.css';
import GameSelectionScreen from './Components/GameSelectionScreen/GameSelectionScreen';
import GameErrorScreen from './Components/GameErrorScreen/GameErrorScreen';
import GameOpponentDisconnectScreen from './Components/GameWaitScreen/GameOpponentDisconnectScreen';
import { GameContext } from '../../../../contexts/GameContext';

interface IGameOverlayProps {}

const GameOverlay: React.FC<IGameOverlayProps> = () => {
	const { gameData } = useContext(GameContext);

	return (
		<div className="game-overlay-wrapper">
			{gameData.connectedToServer &&
				!gameData.opponentIsReconnecting &&
				!gameData.gameIsPlaying &&
				!gameData.connectionErrorStatus && <GameSelectionScreen />}
			{(!gameData.connectedToServer || gameData.connectionErrorStatus) &&
				!gameData.opponentIsReconnecting && <GameErrorScreen />}
			{gameData.opponentIsReconnecting && <GameOpponentDisconnectScreen />}
		</div>
	);
};
export default GameOverlay;
