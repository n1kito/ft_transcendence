import React, { useContext, useEffect, useRef } from 'react';
import './GameCanvas.css';
import { ICanvasProps, IPaddleProps, IBallProps } from '../../Game';
import { Game } from './Entities/Game';
import { GameContext } from '../../../../contexts/GameContext';

interface IGameCanvasProps {
	canvasProps: ICanvasProps;
	paddle1Props: IPaddleProps;
	paddle2Props: IPaddleProps;
	ballProps: IBallProps;
}

const gameCanvas: React.FC<IGameCanvasProps> = ({
	canvasProps,
	paddle1Props,
	paddle2Props,
	ballProps,
}) => {
	const { gameData } = useContext(GameContext);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const gameInstance = useRef<Game | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d');
			if (ctx) {
				gameInstance.current = new Game(canvasRef, ctx);
			}
			// gameInstance.current?.gameLoop();
		}

		return () => {
			gameInstance.current?.cancelGameLoop();
			gameInstance.current?.removeEventListeners();
		};
	}, []); // The empty dependency array ensures this effect runs once, similar to componentDidMount

	useEffect(() => {
		if (gameData.gameIsPlaying) gameInstance.current?.gameLoop();
		else gameInstance.current?.cancelGameLoop();
	}, [gameData.gameIsPlaying]);

	return (
		<canvas
			className="game-canvas"
			width={canvasProps.width}
			height={canvasProps.height}
			ref={canvasRef}
		>
			This browser doesnt support canvas technology, try another or update.
		</canvas>
	);
};

export default gameCanvas;
