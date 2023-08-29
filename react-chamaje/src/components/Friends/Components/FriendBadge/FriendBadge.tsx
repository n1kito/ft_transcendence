import React, { ReactNode, useState } from 'react';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';
import OnlineIndicator from '../../../Profile/Components/Shared/OnlineIndicator/OnlineIndicator';

export interface IFriendBadgeProps extends ShadowWrapperProps {
	badgeTitle?: string;
	badgeImageUrl?: string;
	toolTip?: string;
	onlineIndicator?: boolean;
	isChannelBadge?: boolean;
	isEmptyBadge?: boolean;
	dashedBorder?: boolean;
}

const FriendBadge: React.FC<IFriendBadgeProps> = ({
	isClickable = false,
	shadow = isClickable || false,
	badgeTitle = 'Title',
	badgeImageUrl = m3ganAvatar,
	toolTip = '',
	isChannelBadge = false,
	onlineIndicator = !isChannelBadge,
	isEmptyBadge = false,
	dashedBorder = isEmptyBadge || false,
	onClick,
}) => {
	const [friendIsOnline, setFriendIsOnline] = useState(true); // TODO: this should not be done this way, it should be linked to the user's actual status
	const [friendIsPlaying, setFriendIsPlaying] = useState(false);

	return (
		<ShadowWrapper
			shadow={isEmptyBadge ? true : shadow}
			isClickable={isEmptyBadge ? true : isClickable}
			onClick={onClick}
			dashedBorder={dashedBorder}
		>
			<div
				className={`badge-wrapper ${isEmptyBadge ? 'is-empty-badge' : ''} ${
					isChannelBadge ? 'wide-badge' : ''
				}`}
				title={toolTip}
			>
				{!isEmptyBadge && (
					<>
						<div className="badge-avatar">
							<img src={badgeImageUrl} draggable={false} />
						</div>
						<span className="friend-name">{badgeTitle}</span>
					</>
				)}
				{!isEmptyBadge && onlineIndicator && (
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
