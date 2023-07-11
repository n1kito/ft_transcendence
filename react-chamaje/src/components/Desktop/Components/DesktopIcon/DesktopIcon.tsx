import React, { ReactComponentElement } from 'react';
import './DesktopIcon.css';
// import iconImage from './images/COKE2.svg';

export interface IconProps {
	name: string;
	iconSrc: string;
}

const DesktopIcon: React.FC<IconProps> = ({ name, iconSrc }) => {
	let displayName = name;
	if (displayName.length > 8) displayName = name.slice(0, 8) + '...';
	return (
		<div className="desktopIconWrapper" title={name}>
			<img src={iconSrc}></img>
			<span>{displayName}</span>
		</div>
	);
};

export default DesktopIcon;
