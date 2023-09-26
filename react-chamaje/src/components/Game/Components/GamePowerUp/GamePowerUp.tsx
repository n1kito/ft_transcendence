import { useContext, useEffect, useState } from 'react';
import PowerUpButton from './Components/PowerUpButton/PowerUpButton';
import './GamePowerUp.css';
import { GameContext } from 'src/contexts/GameContext';

const GamePowerUp = () => {
	const { gameData, updateGameData } = useContext(GameContext);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [powerUpTriggered, setPowerUpTriggered] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!gameData.gamePowerUp) return;
			if (currentIndex < gameData.gamePowerUp.length) {
				const expectedKey = gameData.gamePowerUp[currentIndex];
				if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
					setCurrentIndex(currentIndex + 1);
				}
				if (currentIndex === gameData.gamePowerUp.length - 1) {
					setPowerUpTriggered(true);
					setTimeout(() => {
						updateGameData({ gamePowerUp: undefined });
					}, 750);
				}
			}
			// else
			// 	window.alert(
			// 		`gameData.gamePowerUp[currentIndex] = ${gameData.gamePowerUp[currentIndex]}`,
			// 	);
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentIndex]);
	return (
		<div
			className={`game-power-up-wrapper ${
				powerUpTriggered ? 'power-up-triggered' : ''
			}`}
		>
			<span className="game-power-up-title">
				✨{' '}
				<span className="gradient-text">
					{powerUpTriggered ? 'SUCCESS' : 'PRESS THE KEYS TO POWER UP'}
				</span>{' '}
				✨
			</span>
			{powerUpTriggered === false && (
				<div className="power-up-buttons">
					{gameData.gamePowerUp &&
						Array.from(gameData.gamePowerUp).map((letter, index) => (
							<PowerUpButton key={index} pressed={index < currentIndex}>
								{letter.toUpperCase()}
							</PowerUpButton>
						))}
				</div>
			)}
		</div>
	);
};

export default GamePowerUp;
