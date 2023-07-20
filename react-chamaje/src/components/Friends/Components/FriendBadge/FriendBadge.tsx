import React, { ReactNode } from 'react';
import './FriendBadge.css';
import jeeAvatar from './images/79132132.jpeg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';

const FriendBadge = () => {
	return (
		<ShadowWrapper shadow={true} clickable={true}>
			<div className="friendBadge" title="Open Jee's profile">
				<div className="statusIndicator"></div>
				<div className="badgeAvatar"><img src={jeeAvatar} /></div>
				<span>@jeepark</span>
			</div>
		</ShadowWrapper>
	);
};

export default FriendBadge;
