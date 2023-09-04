import React, { useContext } from 'react';
import './ProfileMissions.css';
import Title from '../Title/Title';
import TargetBadge from '../TargetBadge/TargetBadge';
import RivalBadge from '../RivalBadge/RivalBadge';
import { UserContext } from '../../../../contexts/UserContext';

interface IProfileMissionsProps {
	profileLogin: string;
	rivalLogin?: string;
	targetLogin?: string;
	targetDiscoveredByUser: boolean;
}

const ProfileMissions: React.FC<IProfileMissionsProps> = ({
	profileLogin,
	rivalLogin = '',
	targetLogin,
	targetDiscoveredByUser,
}) => {
	const { userData } = useContext(UserContext);
	const isOwnProfile = profileLogin == userData?.login;

	return isOwnProfile || (rivalLogin && rivalLogin.length > 0) ? (
		<div className="profile-missions-wrapper">
			<Title toolTip="Your rival is the person who's beat you the most 💀\nYour target is a random person you should destroy 🔫">
				Missions
			</Title>
			<div className="profile-missions">
				{!rivalLogin && !targetLogin && <p>No missions yet !</p>}
				{rivalLogin && rivalLogin.length > 0 && (
					<RivalBadge rivalLogin={rivalLogin} />
				)}
				{(isOwnProfile || targetDiscoveredByUser) &&
				targetLogin &&
				targetLogin.length > 0 ? (
					<TargetBadge
						targetLogin={targetLogin}
						isOwnProfile={isOwnProfile}
						targetDiscoveredByUser={targetDiscoveredByUser}
					/>
				) : null}
			</div>
		</div>
	) : null;
};

export default ProfileMissions;
