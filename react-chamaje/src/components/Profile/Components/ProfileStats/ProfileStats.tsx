import React, { useContext, useState } from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import { UserContext } from '../../../../contexts/UserContext';
import { IUserData } from '../../../../../../shared-lib/types/user';
import Tooltip from '../../../Shared/Tooltip/Tooltip';

interface ProfileStatsProps {
	profileData: IUserData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData }) => {
	const [bestieIsHovered, setBestieIsHovered] = useState(false);
	const [targetIsHovered, setTargetIsHovered] = useState(false);
	// console.log('Profile data', profileData);
	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				<StatBadge title="Rank">#{profileData.rank || '?'}</StatBadge>
				<StatBadge title="Win Rate">{`${
					profileData.winRate ? `${profileData.winRate}%` : '?'
				}`}</StatBadge>
				<StatBadge title="Played">{profileData.gamesCount}</StatBadge>
				<div
					className="target-tooltip-wrapper"
					onMouseEnter={() => setTargetIsHovered(true)}
					onMouseLeave={() => setTargetIsHovered(false)}
				>
					<Tooltip isVisible={targetIsHovered} position="bottom">
						How many times you've beaten a target 🥊
					</Tooltip>
					<StatBadge title="Killcount">{profileData.killCount}</StatBadge>
				</div>
				<div
					className="bestie-tooltip-wrapper"
					onMouseEnter={() => setBestieIsHovered(true)}
					onMouseLeave={() => setBestieIsHovered(false)}
				>
					<Tooltip isVisible={bestieIsHovered} position="bottom">
						The person you've played the most games with 💖
					</Tooltip>
					<StatBadge
						isTextContent={true}
						title="Bestie ♥️"
						isClickable={profileData.bestieLogin != undefined}
						onClick={() =>
							window.alert(`Open profile for ' + ${profileData.bestieLogin}`)
						}
					>
						{profileData.bestieLogin ? `@${profileData.bestieLogin}` : '?'}
					</StatBadge>
				</div>
			</div>
		</div>
	);
};

export default ProfileStats;
