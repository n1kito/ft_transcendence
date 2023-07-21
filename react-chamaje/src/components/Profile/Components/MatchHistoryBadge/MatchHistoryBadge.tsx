import React, { useState } from 'react';
import './MatchHistoryBadge.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';

const MatchHistoryBadge = () => {
	// TODO: implement this state/variable dynamically
	const [playerWon, setPlayerWon] = useState(true);

	return (
		<div
			className={`match-history-badge ${playerWon ? 'black-and-white' : ''}`}
		>
			<div
				className={`winning-status ${playerWon ? 'player-won' : 'player-lost'}`}
			>
				YOU {`${playerWon ? 'WON' : 'LOST'}`}
			</div>
			<FriendBadge />
			{/* TODO: retrieve actual score here */}
			<BlackBadge>Score: 5/7</BlackBadge>
		</div>
	);
};

export default MatchHistoryBadge;
