import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from 'src/contexts/UserContext';
import OnlineIndicator from '../../../Profile/Components/Shared/OnlineIndicator/OnlineIndicator';
import ShadowWrapper, {
	ShadowWrapperProps,
} from '../../../Shared/ShadowWrapper/ShadowWrapper';
import './FriendBadge.css';
import m3ganAvatar from './images/m3gan.jpg';

export interface IFriendBadgeProps extends ShadowWrapperProps {
	badgeTitle?: string;
	badgeImageUrl?: string;
	toolTip?: string;
	onlineIndicator?: boolean;
	isChannelBadge?: boolean;
	isEmptyBadge?: boolean;
	dashedBorder?: boolean;
	isActive?: boolean;
	shaking?: boolean;
	setFriendIsPlaying?: React.Dispatch<React.SetStateAction<boolean>>;
	playingIndicator?: boolean;
	showStatusIndicator?: boolean;
}

const FriendBadge: React.FC<IFriendBadgeProps> = ({
	isClickable = false,
	isActive = true,
	shadow = isClickable || false,
	badgeTitle = 'Title',
	badgeImageUrl = m3ganAvatar,
	toolTip = '',
	isChannelBadge = false,
	onlineIndicator = false,
	isEmptyBadge = false,
	dashedBorder = isEmptyBadge || false,
	shaking = false,
	onClick,
	setFriendIsPlaying,
	playingIndicator = false,
	showStatusIndicator = true,
}) => {
	const userContext = useContext(UserContext);
	let displayTitle = badgeTitle;
	if (isChannelBadge && badgeTitle.length > 20) {
		displayTitle = badgeTitle.slice(0, 20) + '...';
	}

	// const [friendIsPlaying, setFriendIsPlaying] = useState(false);
	const [isShaking, setIsShaking] = useState(false);

	useEffect(() => {
		if (shaking) {
			const shakeInterval = setInterval(() => {
				setIsShaking(true);
				const shakeDuration = 1000; // Shake for 1 seconds
				setTimeout(() => {
					setIsShaking(false);
				}, shakeDuration);
			}, 5000); // Start shaking every 10 seconds

			// Clean up interval on unmount or when hasStartedRoulette changes to true
			return () => clearInterval(shakeInterval);
		}
	}, [shaking]);

	return (
		// <div className={isShaking ? 'shake' : ''}>
		<ShadowWrapper
			shadow={isEmptyBadge ? true : shadow}
			isClickable={isEmptyBadge ? true : isClickable}
			onClick={onClick}
			dashedBorder={dashedBorder}
			shaking={shaking}
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
							<div
								className={`badge-avatar ${
									!isActive ? 'disable-friend-badge' : ''
								}`}
							>
								<img src={badgeImageUrl} draggable={false} />
							</div>
						)}
						<span className="friend-name">{displayTitle}</span>
					</>
				)}
				{!isEmptyBadge &&
					(onlineIndicator || playingIndicator) &&
					showStatusIndicator && (
					<OnlineIndicator
						isOnline={onlineIndicator}
						isPlaying={playingIndicator}
					/>
				)}
			</div>
		</ShadowWrapper>
		// </div>
	);
};

export default FriendBadge;
