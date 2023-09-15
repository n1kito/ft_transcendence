import React, { forwardRef, useContext, useEffect, useRef } from 'react';
import './GameCanvas.css';
import { ICanvasProps, IPaddleProps, IBallProps } from '../../Game';
import { Game } from './Entities/Game';
import { GameContext } from '../../../../contexts/GameContext';
import { useGameSocket } from '../../../../hooks/useGameSocket';

interface IGameCanvasProps {
	canvasProps: ICanvasProps;
	// paddle1Props: IPaddleProps;
	// paddle2Props: IPaddleProps;
	// ballProps: IBallProps;
}

// Used a forwardRef here. It's a ref that is created by the parent component (Game)
// and passed to this component so it can be assigned to the actual HTML element
const gameCanvas = React.forwardRef<HTMLCanvasElement, IGameCanvasProps>(
	function gameCanvas({ canvasProps }, ref) {
		return (
			<canvas
				className="game-canvas"
				width={canvasProps.width}
				height={canvasProps.height}
				ref={ref}
			>
				This browser doesnt support canvas technology, try another or update.
			</canvas>
		);
	},
);

export default gameCanvas;
