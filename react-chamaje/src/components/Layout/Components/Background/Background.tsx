import React, { useContext } from 'react';
import { GameContext } from 'src/contexts/GameContext';
import './Background.css';

const Background: React.FC = () => {
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
