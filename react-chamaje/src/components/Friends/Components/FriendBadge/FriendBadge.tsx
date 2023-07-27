import React, { ReactNode, useState } from 'react';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';
import OnlineIndicator from '../../../Profile/Components/Shared/OnlineIndicator/OnlineIndicator';

export interface IFriendBadgeProps extends ShadowWrapperProps {
	badgeTitle: string;
	badgeImageUrl?: string;
	toolTip?: string;
	onlineIndicator?: boolean;
}

const FriendBadge: React.FC<IFriendBadgeProps> = ({
	clickable = false,
	shadow = clickable || false,
	badgeTitle,
	badgeImageUrl = m3ganAvatar,
	toolTip = '',
	onlineIndicator = false,
}) => {
	const [friendIsOnline, setFriendIsOnline] = useState(true); // TODO: this should not be done this way, it should be linked to the user's actual status
	const [friendIsPlaying, setFriendIsPlaying] = useState(false);

	return (
		<ShadowWrapper shadow={shadow} clickable={clickable}>
			{/* TODO: change the title property to use the person's actual name */}
			<div className="friendBadge" title={toolTip}>
				<div className="badgeAvatar">
					<img src={badgeImageUrl} draggable={false} />
				</div>
				<span className="friend-name">{badgeTitle}</span>
				{onlineIndicator && (
					<OnlineIndicator
						isOnline={friendIsOnline}
						isPlaying={friendIsPlaying}
					/>
				)}
			</div>
		</ShadowWrapper>
	);
};

export default FriendBadge;
