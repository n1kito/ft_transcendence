import React, { ReactNode, useEffect, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';
import { motion, useDragControls } from 'framer-motion';

export interface MenuLinks {
	name: string;
	url: string;
}

export interface WindowProps {
	windowTitle?: string;
	links?: MenuLinks[];
	useBeigeBackground?: boolean;
	children?: ReactNode;
	constraintRef?: React.RefObject<HTMLDivElement>;
}

const Window: React.FC<WindowProps> = ({
	windowTitle = 'Title',
	children,
	links = [],
	useBeigeBackground = false,
	constraintRef,
}) => {
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
			style={{
				position: isDragged ? 'absolute' : 'static',
			}}
		>
			{/* TODO: I had to put the title bar in a div to give it the onPointerDown property, ideally this would be inclded in the component itself*/}
			<div onPointerDown={triggerDragOnElem}>
				<WindowTitleBar windowTitle={windowTitle} />
			</div>
			<WindowMenu>
				{links.map((linkElem, index) => (
					<a href={linkElem.url} key={index}>
						{linkElem.name}
					</a>
				))}
			</WindowMenu>
			<div
				id="windowContent"
				style={{ backgroundColor: useBeigeBackground ? '#FFFBEC' : '' }}
			>
				{children}
			</div>
		</motion.div>
	);
};

export default Window;
