import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';
import { PanInfo, motion, useDragControls } from 'framer-motion';
import Login from '../Login/Login';
import { start } from 'repl';

export interface MenuLinks {
	name: string;
	url: string;
}

export interface WindowProps {
	windowTitle?: string;
	links?: MenuLinks[];
	children?: ReactNode;
	constraintRef?: React.RefObject<HTMLDivElement>;
}

const Window: React.FC<WindowProps> = ({
	windowTitle = 'Title',
	children,
	links = [],
	constraintRef,
}) => {
	// const [isDragging, setIsDragging] = useState(false);
	// const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
	// const [windowPosition, setWindowPosition] = useState({ top: 100, left: 100 });

	// const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
	// 	event.preventDefault();
	// 	setIsDragging(true);
	// 	setInitialPosition({ x: event.clientX, y: event.clientY });
	// };
	// const handleMouseMove = (event: MouseEvent) => {
	// 	if (isDragging) {
	// 		const newX = event.clientX;
	// 		const newY = event.clientY;
	// 		setWindowPosition((prevPosition: { top: number; left: number }) => ({
	// 			top: prevPosition.top - (initialPosition.y - newY),
	// 			left: prevPosition.left - (initialPosition.x - newX),
	// 		}));
	// 		setInitialPosition({ x: newX, y: newY });
	// 	}
	// };

	// const handleMouseUp = () => {
	// 	setIsDragging(false);
	// };

	// useEffect(() => {
	// 	if (isDragging) {
	// 		document.addEventListener('mousemove', handleMouseMove);
	// 		document.addEventListener('mouseup', handleMouseUp);
	// 		document.addEventListener('mouseleave', handleMouseUp);
	// 	} else {
	// 		document.removeEventListener('mousemove', handleMouseMove);
	// 		document.removeEventListener('mouseup', handleMouseUp);
	// 		document.removeEventListener('mouseleave', handleMouseUp);
	// 	}

	// 	return () => {
	// 		document.removeEventListener('mousemove', handleMouseMove);
	// 		document.removeEventListener('mouseup', handleMouseUp);
	// 		document.removeEventListener('mouseleave', handleMouseUp);
	// 	};
	// }, [isDragging]);

	const dragControls = useDragControls();
	const [isDragged, setIsDragged] = useState(false);
	const [dragEnded, setDragEnded] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	function triggerDragOnElem(event: React.PointerEvent<HTMLDivElement>) {
		dragControls.start(event, {});
	}

	function startDrag() {
		setIsDragged(true);
	}

	const endDrag = () => {
		setDragEnded(true);
	};

	useEffect(() => {
		setHasMounted(true);
	}, []);

	return (
		<motion.div
			initial={!hasMounted ? { opacity: 0, scale: 0, y: '300%' } : {}}
			animate={
				dragEnded ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: '0%' }
			}
			transition={{ duration: 0.5 }}
			id="windowWrapper"
			drag
			onDragStart={startDrag}
			onDragEnd={endDrag}
			whileDrag={{ scale: 0.9, opacity: 0.5 }}
			dragControls={dragControls}
			dragListener={false}
			dragConstraints={constraintRef}
			style={{ position: isDragged ? 'absolute' : 'static' }}
		>
			{/* TODO: I had to put the title bar in a div to give it the onPointerDown property, ideally this would be inclded in the component itself*/}
			<div onPointerDown={triggerDragOnElem}>
				<WindowTitleBar windowTitle={windowTitle} />
			</div>
			<WindowMenu>
				{links.map((linkElem) => (
					<a href={linkElem.url} key={linkElem.url}>
						{linkElem.name}
					</a>
				))}
			</WindowMenu>
			<div id="windowContent">{children}</div>
		</motion.div>
	);
};

export default Window;
