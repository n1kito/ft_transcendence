import React, { ReactNode, useContext, useEffect, useState } from 'react';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import { ShadowWrapperProps } from '../../../Shared/ShadowWrapper/ShadowWrapper';
import OnlineIndicator from '../../../Profile/Components/Shared/OnlineIndicator/OnlineIndicator';
import { UserContext } from 'src/contexts/UserContext';
import { on } from 'events';

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
	onlineIndicator = false,
	isEmptyBadge = false,
	dashedBorder = isEmptyBadge || false,
	onClick,
}) => {
	const userContext = useContext(UserContext);
	let displayTitle = badgeTitle;
	if (isChannelBadge && badgeTitle.length > 20) {
		displayTitle = badgeTitle.slice(0, 20) + '...';
	}

	const [friendIsPlaying, setFriendIsPlaying] = useState(false);

	useEffect(() => {
		if (onlineIndicator === undefined)
			console.log('online indicator is undefined');
		console.log('ONLINE INDICATOR: ', onlineIndicator);
	});

	return (
		<ShadowWrapper
			shadow={isEmptyBadge ? true : shadow}
			isClickable={isEmptyBadge ? true : isClickable}
			onClick={onClick}
			dashedBorder={dashedBorder}
		>
			<div
				className={`badge-wrapper ${isEmptyBadge ? 'is-empty-badge' : ''} ${
					isChannelBadge ? 'channel-badge' : ''
				}`}
				title={toolTip}
			>
				{!isEmptyBadge && (
					<>
						{!isChannelBadge && (
							<div className="badge-avatar">
								<img src={badgeImageUrl} draggable={false} />
							</div>
						)}
						<span className="friend-name">{displayTitle}</span>
					</>
				)}
				{!isEmptyBadge && onlineIndicator && (
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
