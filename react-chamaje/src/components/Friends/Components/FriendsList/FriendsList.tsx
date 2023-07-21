import React from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import MatchHistoryBadge from '../../../Profile/Components/MatchHistoryBadge/MatchHistoryBadge';

const FriendsList = () => {
	return (
		<div>
			<div className="friendsList">
				<FriendBadge shadow={true} clickable={true} />
				<FriendBadge />
				<FriendBadge />
				<FriendBadge />
				<FriendBadge />
				<MatchHistoryBadge />
			</div>
			<div className="bottomInfo">3 friends, 1 online</div>
		</div>
	);
};

export default FriendsList;
