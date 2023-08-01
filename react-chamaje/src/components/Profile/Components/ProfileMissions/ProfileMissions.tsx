import React from 'react';
import './ProfileMissions.css';
import Title from '../Title/Title';
import TargetBadge from '../TargetBadge/TargetBadge';
import RivalBadge from '../RivalBadge/RivalBadge';

const ProfileMissions = () => {
	return (
		<div className="profile-missions-wrapper">
			<Title toolTip="Do not think of them as people, think of them as things.">
				Missions
			</Title>
			<div className="profile-missions">
				<RivalBadge />
				<TargetBadge />
			</div>
		</div>
	);
};

export default ProfileMissions;
