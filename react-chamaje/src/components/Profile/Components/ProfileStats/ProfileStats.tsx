import React from 'react';
import './ProfileStats.css';
import StatBadge from '../StatBadge/StatBadge';
import Title from '../Title/Title';

const ProfileStats = () => {
	// TODO: this should open Jee's profile
	const logSomething = () => {
		console.log('You just had to click this button...');
	};
	return (
		<div className="profile-stats-wrapper">
			<Title>Stats</Title>
			<div className="profile-stats">
				<StatBadge title="Rank">#149</StatBadge>
				<StatBadge title="Win Rate">27%</StatBadge>
				<StatBadge title="Played">120</StatBadge>
				<StatBadge title="Killcount">12</StatBadge>
				<StatBadge
					isTextContent={true}
					title="Bestie ♥️"
					isClickable={true}
					onClick={logSomething}
				>
					@jeepark
				</StatBadge>
			</div>
		</div>
	);
};

export default ProfileStats;
