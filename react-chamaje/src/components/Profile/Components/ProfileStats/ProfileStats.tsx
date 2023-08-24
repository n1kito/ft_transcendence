import React, { useContext } from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import { UserContext } from '../../../../contexts/UserContext';

const ProfileStats = () => {
	const { userData } = useContext(UserContext);

	// TODO: this should open Jee's profile
	const openBestfriendProfile = (bestFriendLogin: string | undefined) => {
		console.log('Open profile for ' + bestFriendLogin);
	};
	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				<StatBadge title="Rank" isClickable={true}>
					#{userData?.rank}
				</StatBadge>
				<StatBadge title="Win Rate">{userData?.winRate}%</StatBadge>
				<StatBadge title="Played">{userData?.gamesCount}</StatBadge>
				<StatBadge title="Killcount">{userData?.killCount}</StatBadge>
				{userData?.bestFriendLogin && (
					<StatBadge
						isTextContent={true}
						title="Bestie ♥️"
						isClickable={true}
						onClick={() => openBestfriendProfile(userData?.bestFriendLogin)}
					>
						@{userData?.bestFriendLogin}
					</StatBadge>
				)}
			</div>
		</div>
	);
};

export default ProfileStats;
