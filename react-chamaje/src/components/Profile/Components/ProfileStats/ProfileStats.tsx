import React, { useContext } from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import { UserContext, UserData } from '../../../../contexts/UserContext';

interface ProfileStatsProps {
	profileData: UserData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profileData }) => {
	// TODO: this should open Jee's profile
	const openBestieProfile = (bestieLogin: string | undefined) => {
		console.log('Open profile for ' + bestieLogin);
	};
	const openLeaderboard = () => {
		console.log('This should just open the leaderboard');
	};
	// console.log('Profile data', profileData);
	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				<StatBadge title="Rank" isClickable={true} onClick={openLeaderboard}>
					#{profileData.rank}
				</StatBadge>
				<StatBadge title="Win Rate">{profileData.winRate}%</StatBadge>
				<StatBadge title="Played">{profileData.gamesCount}</StatBadge>
				<StatBadge title="Killcount">{profileData.killCount}</StatBadge>
				{profileData.bestieLogin && (
					<StatBadge
						isTextContent={true}
						title="Bestie ♥️"
						isClickable={true}
						onClick={() => openBestieProfile(profileData.bestieLogin)}
					>
						@{profileData.bestieLogin}
					</StatBadge>
				)}
			</div>
		</div>
	);
};

export default ProfileStats;
