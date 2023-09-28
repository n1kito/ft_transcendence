import React, { useContext } from 'react';
import './RivalBadge.css';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import OnlineIndicator from '../Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from '../../../../contexts/UserContext';
import { useNavigationParams } from 'src/hooks/useNavigationParams';

interface IRivalBadgeProps {
	rivalLogin: string;
}

const RivalBadge: React.FC<IRivalBadgeProps> = ({ rivalLogin }) => {
	const { userData } = useContext(UserContext);
	const { setNavParam } = useNavigationParams();

	const openRivalProfile = () => {
		setNavParam('friendProfile', rivalLogin);
	};
	return (
		<div className="rival-badge">
			<FriendBadge
				badgeTitle="Rival"
				isClickable={true}
				onlineIndicator={true}
				onClick={openRivalProfile}
				badgeImageUrl={`/api/images/${userData.rivalImage}`}
			/>
			<BlackBadge>@{rivalLogin}</BlackBadge>
		</div>
	);
};

export default RivalBadge;
