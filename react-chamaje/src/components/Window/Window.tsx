import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';
import { motion, useDragControls } from 'framer-motion';
import { getAllByTestId } from '@testing-library/react';

export interface MenuLinks {
	name: string;
	onClick?: () => void;
}

export interface WindowProps {
	windowTitle?: string;
	links?: MenuLinks[];
	useBeigeBackground?: boolean;
	resizable?: boolean;
	children?: ReactNode;
	windowDragConstraintRef?: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const Window: React.FC<WindowProps> = ({
	windowTitle = 'Title',
	resizable = false,
	children,
	links = [],
	useBeigeBackground = false,
	windowDragConstraintRef,
	onCloseClick,
}) => {
	const windowRef = useRef<HTMLDivElement | null>(null);
	const [windowIsBeingResized, setWindowIsBeingResized] = useState(false);
	const [dimensions, setDimensions] = useState({
		width: 0,
		height: 0,
	});

	const dragControls = useDragControls();

	function triggerDragOnElem(event: React.PointerEvent<HTMLDivElement>) {
		dragControls.start(event, {});
	}

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		if (windowRef.current) {
	// 			const { width, height } = windowRef.current.getBoundingClientRect();
	// 			console.log({ width, height });
	// 			setDimensions({ width, height });
	// 		}
	// 	}, 500); // TODO: Not a huge fan of using setTimeOut be because of the "mouting" effect of framer motion we need to wait for the div to have its actual size
	// }, []);

	useEffect(() => {
		if (resizable) {
			const handleResize = (event: MouseEvent) => {
				if (windowIsBeingResized) {
					console.log('moving window handle');
				}
			};
			const handleMouseUp = () => {
				if (windowIsBeingResized) {
					setWindowIsBeingResized(false);
					console.log('window is not being resized no more');
				}
			};

			window.addEventListener('mousemove', handleResize);
			window.addEventListener('mouseup', handleMouseUp);

			// Clean up the event listener when the component unmounts
			return () => {
				window.removeEventListener('mousemove', handleResize);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [resizable, windowIsBeingResized]);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ opacity: 0, scale: 0 }}
			transition={{ duration: 0.2 }}
			className="window-wrapper"
			drag={true}
			// onDragStart={startDrag}
			// onDragEnd={endDrag}
			whileDrag={{ scale: 0.9, opacity: 0.85 }}
			dragControls={dragControls}
			dragListener={false}
			dragConstraints={windowDragConstraintRef}
			// style={{
			// 	width: `${dimensions.width}px`,
			// 	height: `${dimensions.height}px`,
			// }}
			ref={windowRef}
			onAnimationComplete={() => {
				// Once the div has transitionned in, store its initial dimensions in the corresponding state
				if (resizable && windowRef.current) {
					const { width, height } = windowRef.current.getBoundingClientRect();
					setDimensions({ width, height });
				}
			}}
			// style={{
			// 	position: isDragged ? 'absolute' : 'static',
			// }}
		>
			{/* TODO: I had to put the title bar in a div to give it the onPointerDown property, ideally this would be inclded in the component itself*/}
			<div onPointerDown={triggerDragOnElem}>
				<WindowTitleBar windowTitle={windowTitle} onCloseClick={onCloseClick} />
			</div>
			<WindowMenu>
				{links.map((linkElem, index) => (
					<span onClick={linkElem.onClick} key={index}>
						{linkElem.name}
					</span>
				))}
			</WindowMenu>
			<div
				className="window-content"
				style={{ backgroundColor: useBeigeBackground ? '#FFFBEC' : '' }}
			>
				{children}
			</div>
			<div
				className="window-resize-handle"
				onMouseDown={() => {
					setWindowIsBeingResized(true);
					console.log('window is being resized');
				}}
			></div>
		</motion.div>
	);
};

export default Window;
