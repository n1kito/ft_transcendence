import React, { useContext } from 'react';
import { UserContext } from '../../../../contexts/UserContext';
import RivalBadge from '../RivalBadge/RivalBadge';
import TargetBadge from '../TargetBadge/TargetBadge';
import Title from '../Title/Title';
import './ProfileMissions.css';

interface IProfileMissionsProps {
	profileLogin: string;
	rivalLogin: string;
	rivalImage: string;
	targetLogin: string;
	targetImage: string;
	targetDiscoveredByUser: boolean;
}

const ProfileMissions: React.FC<IProfileMissionsProps> = ({
	profileLogin,
	rivalLogin,
	targetImage,
	rivalImage,
	targetLogin,
	targetDiscoveredByUser,
}) => {
	const { userData } = useContext(UserContext);
	const isOwnProfile = profileLogin == userData?.login;

	return (
		<div className="profile-missions-wrapper">
			<Title
				toolTip={`${
					rivalLogin
						? 'Your rival is the person who has beat you the most 💀\n'
						: ''
				}Your target is a random person you should destroy 🔫`}
			>
				Missions
			</Title>
			<div className="profile-missions">
				{!rivalLogin && !targetLogin && <p>No missions yet !</p>}
				{rivalLogin && rivalLogin.length > 0 && (
					<RivalBadge rivalLogin={rivalLogin} rivalImage={rivalImage} />
				)}
				{(isOwnProfile || targetDiscoveredByUser) &&
				targetLogin &&
				targetLogin.length > 0 ? (
						<TargetBadge
							targetLogin={targetLogin}
							targetImage={targetImage}
							isOwnProfile={isOwnProfile}
							targetDiscoveredByUser={targetDiscoveredByUser}
						/>
					) : null}
			</div>
		</div>
	);
};

export default ProfileMissions;
