import React, { useState } from 'react';
import { useNavigationParams } from 'src/hooks/useNavigationParams';
import { IUserData } from '../../../../../../shared-lib/types/user';
import Tooltip from '../../../Shared/Tooltip/Tooltip';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import './ProfileStats.css';

interface ProfileStatsProps {
	profileData: IUserData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData }) => {
	const { setNavParam } = useNavigationParams();
	const [bestieIsHovered, setBestieIsHovered] = useState(false);
	const [targetIsHovered, setTargetIsHovered] = useState(false);

	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				<StatBadge title="Rank">#{profileData.rank || '?'}</StatBadge>
				<StatBadge title="Win Rate">{`${
					profileData.winRate != undefined ? `${profileData.winRate}%` : '?'
				}`}</StatBadge>
				<StatBadge title="Played">{profileData.gamesCount}</StatBadge>
				<div
					className="target-tooltip-wrapper"
					onMouseEnter={() => setTargetIsHovered(true)}
					onMouseLeave={() => setTargetIsHovered(false)}
				>
					<Tooltip isVisible={targetIsHovered} position="bottom">
						How many times you have beaten a target 🥊
					</Tooltip>
					<StatBadge title="Killcount">{profileData.killCount}</StatBadge>
				</div>
				<div
					className="bestie-tooltip-wrapper"
					onMouseEnter={() => setBestieIsHovered(true)}
					onMouseLeave={() => setBestieIsHovered(false)}
				>
					<Tooltip isVisible={bestieIsHovered} position="bottom">
						The person you have played the most games with 💖
					</Tooltip>
					<StatBadge
						isTextContent={true}
						title="Bestie ♥️"
						isClickable={profileData.bestieLogin != undefined}
						onClick={() => {
							setNavParam('friendProfile', profileData.bestieLogin);
						}}
					>
						{profileData.bestieLogin ? `@${profileData.bestieLogin}` : '?'}
					</StatBadge>
				</div>
			</div>
		</div>
	);
};

export default ProfileStats;
