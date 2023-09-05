import React, { useEffect, useRef, useState } from 'react';
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
	const [userHasOpponent, setUserHasOpponent] = useState(true);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const canvasDrawingCtx = canvasRef.current.getContext('2d');
	}, []);
	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<div className={`game-wrapper`}>
				{userHasOpponent ? (
					<>
						<canvas
							className="game-canvas"
							ref={canvasRef}
							width={500}
							height={500}
						></canvas>
					</>
				) : (
					<>
						<span className="game-waiting">Waiting for a match...</span>
					</>
				)}
			</div>
		</Window>
	);
};

export default Game;
