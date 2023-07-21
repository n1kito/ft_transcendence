import React from 'react';
import './RivalBadge.css';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';

const RivalBadge = () => {
	return (
		<div className='rival-badge'>
			<FriendBadge />
			<BlackBadge>@megan</BlackBadge>
		</div>
	);
};

export default RivalBadge;
