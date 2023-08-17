import React from 'react';
import './RivalBadge.css';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';

const RivalBadge = () => {
	return (
		<div className="rival-badge">
			<FriendBadge
				badgeTitle="Rival"
				isClickable={true}
				onlineIndicator={true}
			/>
			<BlackBadge>@megan</BlackBadge>
		</div>
	);
};

export default RivalBadge;
