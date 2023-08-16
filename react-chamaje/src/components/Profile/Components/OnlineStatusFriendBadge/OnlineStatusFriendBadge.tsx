import React, { useState } from 'react';
import './OnlineStatusFriendBadge.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';

interface IOnlineStatusFriendsBadgeProps {
	badgeTitle: string;
	badgeImageUrl?: string;
}

const OnlineStatusFriendBadge: React.FC<IOnlineStatusFriendsBadgeProps> = ({
	badgeTitle,
	badgeImageUrl,
}) => {
	return (
		<div className="online-status-friend-badge">
			<FriendBadge
				badgeTitle={badgeTitle}
				badgeImageUrl={badgeImageUrl}
				isClickable={true}
				onlineIndicator={true}
			/>
		</div>
	);
};

export default OnlineStatusFriendBadge;
