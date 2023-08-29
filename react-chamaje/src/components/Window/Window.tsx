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
	windowDragConstraintRef?: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const Window: React.FC<WindowProps> = ({
	windowTitle = 'Title',
	children,
	links = [],
	useBeigeBackground = false,
	windowDragConstraintRef,
	onCloseClick,
}) => {
	const dragControls = useDragControls();

	function triggerDragOnElem(event: React.PointerEvent<HTMLDivElement>) {
		dragControls.start(event, {});
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ opacity: 0, scale: 0 }}
			transition={{ duration: 0.5 }}
			className="windowWrapper"
			drag={true}
			// onDragStart={startDrag}
			// onDragEnd={endDrag}
			whileDrag={{ scale: 0.9, opacity: 0.5 }}
			dragControls={dragControls}
			dragListener={false}
			dragConstraints={windowDragConstraintRef}
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
					<a href={linkElem.url} key={index}>
						{linkElem.name}
					</a>
				))}
			</WindowMenu>
			<div
				className="windowContent"
				style={{ backgroundColor: useBeigeBackground ? '#FFFBEC' : '' }}
			>
				{children}
			</div>
		</motion.div>
	);
};

export default Window;
