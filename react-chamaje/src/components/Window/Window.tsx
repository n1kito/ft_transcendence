import React, { useEffect, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';

export interface WindowProps {
	windowTitle?: string;
}

const Window: React.FC<WindowProps> = ({ windowTitle = 'Title' }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
	const [windowPosition, setWindowPosition] = useState({ top: 100, left: 100 });

	const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
		setInitialPosition({ x: event.clientX, y: event.clientY });
	};
	const handleMouseMove = (event: MouseEvent) => {
		if (isDragging) {
			const newX = event.clientX;
			const newY = event.clientY;
			setWindowPosition((prevPosition: { top: number; left: number }) => ({
				top: prevPosition.top - (initialPosition.y - newY),
				left: prevPosition.left - (initialPosition.x - newX),
			}));
			setInitialPosition({ x: newX, y: newY });
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			document.addEventListener('mouseleave', handleMouseUp);
		} else {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mouseleave', handleMouseUp);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mouseleave', handleMouseUp);
		};
	}, [isDragging]);

	return (
		<div
			id="windowWrapper"
			style={{ top: windowPosition.top, left: windowPosition.left }}
		>
			<WindowTitleBar
				windowTitle={windowTitle}
				onMouseDown={handleMouseDown}
			/>
			<WindowMenu>
				<span>Menu 1</span>
				<span>Menu 2</span>
				<span>Menu 3</span>
			</WindowMenu>
			<div id="windowContent"></div>
		</div>
	);
};

export default Window;
