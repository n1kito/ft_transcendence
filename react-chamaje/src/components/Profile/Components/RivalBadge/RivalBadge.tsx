import React, { useContext } from 'react';
import { useNavigationParams } from 'src/hooks/useNavigationParams';
import { UserContext } from '../../../../contexts/UserContext';
import FriendBadge from '../../../Friends/Components/FriendBadge/FriendBadge';
import BlackBadge from '../Shared/BlackBadge/BlackBadge';
import './RivalBadge.css';

interface IRivalBadgeProps {
	rivalLogin: string;
	rivalImage: string;
}

const RivalBadge: React.FC<IRivalBadgeProps> = ({ rivalLogin, rivalImage }) => {
	const { userData } = useContext(UserContext);
	const { setNavParam } = useNavigationParams();

	const rivalIsUser = rivalLogin === userData.login;

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
				badgeImageUrl={`/api/images/${rivalImage}`}
				showStatusIndicator={!rivalIsUser}
			/>
			<BlackBadge>@{rivalLogin}</BlackBadge>
		</div>
	);
};

export default RivalBadge;
