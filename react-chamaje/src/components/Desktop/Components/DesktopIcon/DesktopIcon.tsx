import React, { MouseEvent, ReactComponentElement, useState } from 'react';
import './DesktopIcon.css';
import Window from '../../../Window/Window';
// import iconImage from './images/COKE2.svg';

export interface IconProps {
	name: string;
	iconSrc: string;
	onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
}

const DesktopIcon: React.FC<IconProps> = ({
	name,
	iconSrc,
	onDoubleClick = undefined,
}) => {
	let displayName = name;
	if (displayName.length > 8) displayName = name.slice(0, 8) + '...';

	return (
		<div
			className="desktopIconWrapper"
			title={name}
			onDoubleClick={onDoubleClick}
		>
			<img src={iconSrc}></img>
			<span>{displayName}</span>
		</div>
	);
};

export default DesktopIcon;
