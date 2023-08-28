import React, { useState } from 'react';
import './AchievementBadge.css';
import burgerIcon from './../../icons/burger-icon.svg';
import Tooltip from '../../../Shared/Tooltip/Tooltip';

interface IAchievementBadgeProps {
	icon: string;
	name: string;
	description: string;
	achieved?: boolean;
}

const AchievementBadge: React.FC<IAchievementBadgeProps> = ({
	icon,
	name,
	description,
	achieved = false,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div className={`achievement-badge-wrapper ${achieved ? 'achieved' : ''}`}>
			<img
				src={icon}
				onMouseEnter={() => {
					console.log('HOVER');
					setIsHovered(true);
				}}
				onMouseLeave={() => setIsHovered(false)}
			/>
			<Tooltip tooltipTitle={name} isVisible={isHovered} position="bottom">
				{description}
			</Tooltip>
		</div>
	);
};

export default AchievementBadge;
