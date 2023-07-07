import React from 'react';
import './WindowTitleBar.css';
import WindowCloseSquare from '../WindowCloseSquare/WindowCloseSquare';
import WindowTitle from '../WindowTitle/WindowTitle';

interface TitleBarProps {
	windowTitle?: string;
	onMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const WindowTitleBar: React.FC<TitleBarProps> = ({
	windowTitle,
	onMouseDown,
}) => {
	return (
		<div id="titleBarWrapper" onMouseDown={onMouseDown}>
			<span>
				<WindowCloseSquare />
			</span>
			<div id="windowTitle">
				<WindowTitle windowTitle={windowTitle} />
			</div>
			<div id="extra"></div>
			{/* <div id="stripes"></div> */}
		</div>
	);
};

export default WindowTitleBar;
