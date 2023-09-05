import React, { useState } from 'react';
import './Game.css';
import Window from '../Window/Window';

interface IGameProps {
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const Game: React.FC<IGameProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	const [userHasOpponent, setUserHasOpponent] = useState(false);
	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
		>
			{userHasOpponent ? (
				<div className="game-wrapper"></div>
			) : (
				'Waiting for a match...'
			)}
		</Window>
	);
};

export default Game;
