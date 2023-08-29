import React from 'react';
import './PrivateMessagesList.css';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';

const PrivateMessagesList = () => {
	const chatsList = [''];

	// Locate
	return (
		<div className="private-messages-list-wrapper">
			{chatsList.length > 0 ? (
				<>
					<FriendBadge isClickable={true} />
					<FriendBadge isClickable={true} />
					<FriendBadge isClickable={true} />
				</>
			) : (
				<FriendBadge isEmptyBadge={true} isChannelBadge={false} />
			)}
		</div>
	);
};

export default PrivateMessagesList;
