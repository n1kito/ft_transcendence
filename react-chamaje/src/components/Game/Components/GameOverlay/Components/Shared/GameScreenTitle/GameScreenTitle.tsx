import React from 'react';
import './GameScreenTitle.css';

interface IGameScreenTitleProps {
	children: React.ReactNode;
}

const GameScreenTitle: React.FC<IGameScreenTitleProps> = ({ children }) => {
	return <span className="game-screen-title">{children}</span>;
};

export default GameScreenTitle;
