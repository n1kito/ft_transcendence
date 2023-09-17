import React, { useContext } from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import { UserContext } from '../../../../contexts/UserContext';
import { IUserData } from '../../../../../../shared-lib/types/user-types';

interface ProfileStatsProps {
	profileData: IUserData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData }) => {
	// TODO: this should open Jee's profile
	const openBestieProfile = (bestieLogin: string | undefined) => {
		console.log('Open profile for ' + bestieLogin);
	};
	// console.log('Profile data', profileData);
	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				{profileData.rank && (
					<StatBadge title="Rank">#{profileData.rank}</StatBadge>
				)}
				<StatBadge title="Win Rate">{profileData.winRate}%</StatBadge>
				<StatBadge title="Played">{profileData.gamesCount}</StatBadge>
				<StatBadge title="Killcount">{profileData.killCount}</StatBadge>
				<StatBadge
					isTextContent={true}
					title="Bestie ♥️"
					isClickable={profileData.bestieLogin != undefined}
					onClick={() => openBestieProfile(profileData.bestieLogin)}
				>
					{profileData.bestieLogin ? `@${profileData.bestieLogin}` : '?'}
				</StatBadge>
			</div>
		</div>
	);
};

export default ProfileStats;
