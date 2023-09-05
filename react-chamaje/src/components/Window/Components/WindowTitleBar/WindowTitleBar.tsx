import React from 'react';
import './WindowTitleBar.css';
import WindowCloseSquare from '../WindowCloseSquare/WindowCloseSquare';
import WindowTitle from '../WindowTitle/WindowTitle';

interface TitleBarProps {
	windowTitle?: string;
	onMouseDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
	onCloseClick: () => void;
}

const WindowTitleBar: React.FC<TitleBarProps> = ({
	windowTitle,
	onMouseDown,
	onCloseClick,
}) => {
	return (
		<div id="titleBarWrapper" onMouseDown={onMouseDown}>
			<span>
				<WindowCloseSquare onCloseClick={onCloseClick} />
			</span>
			<div id="windowTitle">
				<WindowTitle windowTitle={windowTitle} />
			</div>
			<div id="extra"></div>
		</div>
	);
};

export default WindowTitleBar;
