import React, { ReactNode, useContext, useState } from 'react';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';
import OnlineIndicator from '../../../Profile/Components/Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from 'src/contexts/UserContext';

export interface IFriendBadgeProps extends ShadowWrapperProps {
	badgeTitle: string;
	badgeImageUrl?: string;
	toolTip?: string;
	onlineIndicator?: boolean;
}

const FriendBadge: React.FC<IFriendBadgeProps> = ({
	isClickable = false,
	shadow = isClickable || false,
	badgeTitle,
	badgeImageUrl = m3ganAvatar,
	toolTip = '',
	onlineIndicator = false,
}) => {
	const userContext = useContext(UserContext);
	const [friends, setFriends] = useState(userContext.userData?.friends); // TODO: this should not be done this way, it should be linked to the user's actual status
	const [friendIsPlaying, setFriendIsPlaying] = useState(false);

	return (
		<ShadowWrapper shadow={shadow} isClickable={isClickable}>
			{/* TODO: change the title property to use the person's actual name */}
			<div className="friendBadge" title={toolTip}>
				<div className="badgeAvatar">
					<img src={badgeImageUrl} draggable={false} />
				</div>
				<span className="friend-name">{badgeTitle}</span>
				{onlineIndicator && (
					<OnlineIndicator
						isOnline={onlineIndicator}
						isPlaying={friendIsPlaying}
					/>
				)}
			</div>
		</ShadowWrapper>
	);
};

export default FriendBadge;
