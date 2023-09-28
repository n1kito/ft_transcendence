import { useContext, useEffect, useState } from 'react';
import PowerUpButton from './Components/PowerUpButton/PowerUpButton';
import './GamePowerUp.css';
import { GameContext } from 'src/contexts/GameContext';

const GamePowerUp = () => {
	const { gameData } = useContext(GameContext);

	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!gameData.gamePowerUp) return;
			if (currentIndex < gameData.gamePowerUp.length) {
				const expectedKey = gameData.gamePowerUp[currentIndex];
				if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
					setCurrentIndex(currentIndex + 1);
				}
				if (currentIndex === gameData.gamePowerUp.length - 1) {
					gameData.socket?.emit('power-up-activated');
				}
			}
		};

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [currentIndex]);
	return (
		<div
			className={`game-power-up-wrapper ${
				gameData.powerUpClaimed ? 'power-up-triggered' : ''
			}`}
		>
			<span className="game-power-up-title">
				{`${gameData.wonPowerUp ? '✨' : ''}`}
				<span className="gradient-text">
					{gameData.powerUpClaimed && gameData.wonPowerUp
						? ' SUCCESS !!! '
						: gameData.powerUpClaimed && !gameData.wonPowerUp
						? ' TOO LATE :( '
						: ' PRESS THE KEYS TO POWER UP '}
				</span>
				{`${gameData.wonPowerUp ? '✨' : ''}`}
			</span>
			{!gameData.powerUpClaimed && (
				<div className="power-up-buttons">
					{gameData.gamePowerUp &&
						Array.from(gameData.gamePowerUp).map((letter, index) => (
							<PowerUpButton key={index} pressed={index < currentIndex}>
								{letter.toUpperCase()}
							</PowerUpButton>
						))}
				</div>
			)}
			{gameData.powerUpClaimed && (
				<span className="power-up-description">
					{gameData.powerUpDescription} mode activated
				</span>
			)}
		</div>
	);
};

export default GamePowerUp;
