import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';
import { motion, useDragControls } from 'framer-motion';

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
	const [dragIsEnabled, setDragIsEnabled] = useState(false);
	const windowRef = useRef<HTMLDivElement | null>(null);
	const [windowIsBeingResized, setWindowIsBeingResized] = useState(false);
	const previousWindowSize = useRef({
		width: 0,
		height: 0,
	});
	const previousMouseCoordinates = useRef({
		x: 0,
		y: 0,
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
			// Handle resizing process
			const handleResize = (event: MouseEvent) => {
				if (!windowIsBeingResized) return;
				if (windowRef.current) {
					// See how much the mouse has moved
					const xMoveDistance =
						event.clientX - previousMouseCoordinates.current.x;
					const yMoveDistance =
						event.clientY - previousMouseCoordinates.current.y;
					// Calculate the new dimensions of the window
					const newWindowWidth =
						previousWindowSize.current.width + xMoveDistance;
					const newWindowHeight =
						previousWindowSize.current.height + yMoveDistance;
					// Update the div dimensions
					// if those new dimensions are not too small or too big
					if (
						newWindowHeight <= window.innerHeight * 0.85 &&
						newWindowHeight >= window.innerHeight * 0.5
					)
						windowRef.current.style.height = `${newWindowHeight}px`;
					if (
						newWindowWidth <= window.innerWidth * 0.95 &&
						newWindowWidth >= window.innerWidth * 0.3
					)
						windowRef.current.style.width = `${newWindowWidth}px`;
				}
			};
			// Mouse is released
			const handleMouseUp = () => {
				if (windowIsBeingResized) {
					setWindowIsBeingResized(false);
					console.log('window is not being resized no more');
				}
			};

			// Add event listener to the window
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
			drag={dragIsEnabled}
			whileDrag={{ scale: 0.9, opacity: 0.85 }}
			dragControls={dragControls}
			dragListener={false}
			dragConstraints={windowDragConstraintRef}
			ref={windowRef}
			onAnimationComplete={() => {
				// Once the div has fully transitionned in,
				// store its initial dimensions in the corresponding state
				if (resizable && windowRef.current) {
					const { width, height } = windowRef.current.getBoundingClientRect();
					previousWindowSize.current.width = width;
					previousWindowSize.current.height = height;
				}
				setDragIsEnabled(true);
			}}
		>
			{/* TODO: I had to put the title bar in a div to give it the onPointerDown property, ideally this would be inclded in the component itself*/}
			<WindowTitleBar
				windowTitle={windowTitle}
				onCloseClick={onCloseClick}
				onMouseDown={triggerDragOnElem}
			/>
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
			{resizable && (
				<div
					className="window-resize-handle"
					onMouseDown={(event) => {
						setWindowIsBeingResized(true);
						previousMouseCoordinates.current.x = event.clientX;
						previousMouseCoordinates.current.y = event.clientY;
						const currentWindowSize =
							windowRef.current?.getBoundingClientRect();
						if (currentWindowSize) {
							previousWindowSize.current.height = currentWindowSize?.height;
							previousWindowSize.current.width = currentWindowSize?.width;
						}
						console.log('window is being resized');
					}}
				></div>
			)}
		</motion.div>
	);
};

export default Window;
