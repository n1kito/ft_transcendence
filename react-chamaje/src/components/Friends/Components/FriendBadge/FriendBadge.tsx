import React, { ReactNode } from 'react';
import './FriendBadge.css';
import jeeAvatar from './images/79132132.jpeg';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';

const FriendBadge: React.FC<ShadowWrapperProps> = ({
	clickable = false,
	shadow = clickable || false,
}) => {
	return (
		<ShadowWrapper shadow={shadow} clickable={clickable}>
			{/* TODO: change the title property to use the person's actual name */}
			<div className="friendBadge" title="Open Jee's profile">
				{/* <div className="statusIndicator"></div> */}
				<div className="badgeAvatar">
					<img src={m3ganAvatar} />
				</div>
				<span className="friend-name">@m3gan</span>
			</div>
		</ShadowWrapper>
	);
};

export default FriendBadge;
