import React, { useState } from 'react';
import './OnlineStatusFriendBadge.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';

interface IOnlineStatusFriendsBadgeProps {
	badgeTitle: string;
	badgeImage?: string;
}

const OnlineStatusFriendBadge: React.FC<IOnlineStatusFriendsBadgeProps> = ({
	badgeTitle,
	badgeImage,
}) => {
	const [friendIsOnline, setFriendIsOnline] = useState(true);
	const [friendIsPlaying, setFriendIsPlaying] = useState(false);
	return (
		<div
			className={`online-status-friend-badge ${
				friendIsPlaying ? 'friend-is-playing' : ''
			}`}
		>
			{friendIsOnline && <div className="status-indicator"></div>}
			<FriendBadge badgeTitle={badgeTitle} badgeImage={badgeImage} />
		</div>
	);
};

export default OnlineStatusFriendBadge;
