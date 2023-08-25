import React, { useContext } from 'react';
import './RivalBadge.css';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from '../../../../contexts/UserContext';

interface IRivalBadgeProps {
	rivalLogin: string;
}

const RivalBadge: React.FC<IRivalBadgeProps> = ({ rivalLogin }) => {
	const { userData } = useContext(UserContext);
	const openRivalProfile = () => {
		// TODO:
		console.log(`This should open ${rivalLogin}'s profile`);
	};
	return (
		<div className="rival-badge">
			<FriendBadge
				badgeTitle="Rival"
				isClickable={true}
				onlineIndicator={true}
				onClick={openRivalProfile}
			/>
			<BlackBadge>@{rivalLogin}</BlackBadge>
		</div>
	);
};

export default RivalBadge;
