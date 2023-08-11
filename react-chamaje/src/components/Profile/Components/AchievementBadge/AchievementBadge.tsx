import React, { useState } from 'react';
import './AchievementBadge.css';
import burgerIcon from './../../icons/burger-icon.svg';
import Tooltip from '../../../Shared/Tooltip/Tooltip';

interface IAchievementBadgeProps {
	achievementTitle: keyof typeof achievementList;
}

interface IAchievementData {
	icon: string;
	name: string;
	description: string;
}

// Here we can list all different achievements and their descriptions
// The component will look at achievementTitle prop and populate itself accordingly
const achievementList: Record<string, IAchievementData> = {
	neverDied: {
		icon: burgerIcon,
		name: 'McDonalds Killer',
		description:
			'You like mixing ketchup and mayonnaise\nand should therefore be put down. 🙃',
	},
};

const AchievementBadge: React.FC<IAchievementBadgeProps> = ({
	achievementTitle,
}) => {
	const achievement = achievementList[achievementTitle];
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="achievement-badge-wrapper"
			onMouseEnter={() => {
				console.log('HOVER');
				setIsHovered(true);
			}}
			onMouseLeave={() => setIsHovered(false)}
		>
			<img src={achievement.icon} />
			<Tooltip
				tooltipTitle={achievement.name}
				isVisible={isHovered}
				position="right"
			>
				{achievement.description}
			</Tooltip>
		</div>
	);
};

export default AchievementBadge;
