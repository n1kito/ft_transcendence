import React from 'react';
import './FriendBadge.css';
import jeeAvatar from './images/79132132.jpeg';

const FriendBadge = () => {
	return (
		<div className="friendBadge selected" title="Open Jee's profile">
			<img className="" src={jeeAvatar} />
			<span>jeepark</span>
		</div>
	);
};

export default FriendBadge;
