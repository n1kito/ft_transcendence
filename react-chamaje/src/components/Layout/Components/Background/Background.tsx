import React, { useContext, useEffect } from 'react';
import './Background.css';
import { GameContext } from 'src/contexts/GameContext';

const Background = () => {
	const { gameData } = useContext(GameContext);

	return (
		<div id="bgWrapper">
			<div id="blur"></div>
			<div
				className={`background-dot dot-1 ${
					gameData.gameIsPlaying ? 'stop-dot-animation' : ''
				}`}
			></div>
			<div
				className={`background-dot dot-2 ${
					gameData.gameIsPlaying ? 'stop-dot-animation' : ''
				}`}
			></div>
			<div
				className={`background-dot dot-3 ${
					gameData.gameIsPlaying ? 'stop-dot-animation' : ''
				}`}
			></div>
		</div>
	);
};

export default Background;
