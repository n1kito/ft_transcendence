import React, { useContext } from 'react';
import './RivalBadge.css';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from '../../../../contexts/UserContext';

const RivalBadge = () => {
	const { userData } = useContext(UserContext);
	return (
		<div className="rival-badge">
			<FriendBadge
				badgeTitle="Rival"
				isClickable={true}
				onlineIndicator={true}
			/>
			<BlackBadge>@{userData?.rivalLogin}</BlackBadge>
		</div>
	);
};

export default RivalBadge;
