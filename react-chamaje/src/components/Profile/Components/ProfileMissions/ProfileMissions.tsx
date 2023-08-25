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
}

const ProfileMissions: React.FC<IProfileMissionsProps> = ({
	profileLogin,
	rivalLogin = '',
	targetLogin,
}) => {
	const { userData } = useContext(UserContext);
	const isOwnProfile = profileLogin == userData?.login;

	return (
		<div className="profile-missions-wrapper">
			<Title toolTip="Do not think of them as people, think of them as things.">
				Missions
			</Title>
			<div className="profile-missions">
				{!rivalLogin && !targetLogin && <p>No missions yet !</p>}
				{rivalLogin && rivalLogin.length > 0 && (
					<RivalBadge rivalLogin={rivalLogin} />
				)}
				{targetLogin && targetLogin.length > 0 && (
					<TargetBadge targetLogin={targetLogin} isOwnProfile={isOwnProfile} />
				)}
			</div>
		</div>
	);
};

export default ProfileMissions;
