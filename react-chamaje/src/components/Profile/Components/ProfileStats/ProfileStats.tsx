import React, { useContext } from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';
import { UserContext } from '../../../../contexts/UserContext';

const ProfileStats = () => {
	const { userData } = useContext(UserContext);

	// TODO: this should open Jee's profile
	const logSomething = () => {
		console.log('You just had to click this button...');
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
				{userData?.bestie && (
					<StatBadge
						isTextContent={true}
						title="Bestie ♥️"
						isClickable={true}
						onClick={logSomething}
					>
						@jeepark
					</StatBadge>
				)}
			</div>
		</div>
	);
};

export default ProfileStats;
