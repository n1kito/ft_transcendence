import React from 'react';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';

export interface IFriendBadgeProps extends ShadowWrapperProps {
	badgeTitle: string;
	badgeImage?: string;
}

const FriendBadge: React.FC<IFriendBadgeProps> = ({
	clickable = false,
	shadow = clickable || false,
	badgeTitle,
	badgeImage = m3ganAvatar,
}) => {
	return (
		<ShadowWrapper shadow={shadow} clickable={clickable}>
			{/* TODO: change the title property to use the person's actual name */}
			<div className="friendBadge" title="Open Jee's profile">
				<div className="badgeAvatar">
					<img src={badgeImage} />
				</div>
				<span className="friend-name">{badgeTitle}</span>
			</div>
		</ShadowWrapper>
	);
};

export default FriendBadge;
