import React, { useState } from 'react';
import './MatchHistoryBadge.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';

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
			<div className="score-status">Score: 7/5</div>
		</div>
	);
};

export default MatchHistoryBadge;
