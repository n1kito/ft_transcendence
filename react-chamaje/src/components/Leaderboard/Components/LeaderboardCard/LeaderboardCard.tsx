import React from 'react';
import './LeaderboardCard.css';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';

interface ILeaderboardProps {
	login: string;
}

const LeaderboardCard = () => {
	return (
		<div className="leaderboard-card-wrapper">
			<ShadowWrapper
				isClickable={true}
				onClick={() => {
					window.alert("This should open the user's profile");
				}}
			>
				This is a leaderboardCard
			</ShadowWrapper>{' '}
		</div>
	);
};

export default LeaderboardCard;
