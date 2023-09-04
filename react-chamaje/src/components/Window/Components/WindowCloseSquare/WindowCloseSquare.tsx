import React from 'react';
import './WindowCloseSquare.css';

interface IWindowCloseSquareProps {
	onCloseClick: () => void;
}

const WindowCloseSquare: React.FC<IWindowCloseSquareProps> = ({
	onCloseClick,
}) => {
	return (
		<div className="close-square" title="Close window" onClick={onCloseClick}>
			<div className="inside-square"></div>
		</div>
	);
};

export default WindowCloseSquare;
