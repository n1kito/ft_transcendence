import React, { useEffect } from 'react';
import './OnlineIndicator.css';

interface IOnlineIndicatorProps {
	isOnline?: boolean;
	isPlaying?: boolean;
}

const OnlineIndicator: React.FC<IOnlineIndicatorProps> = ({
	isOnline = false,
	isPlaying = false,
}) => {
	return (
		<div
			className={`status-indicator ${
				isPlaying
					? 'status-indicator-is-playing'
					: isOnline // prettier-ignore
						? 'status-indicator-is-online' // prettier-ignore
						: '' // prettier-ignore
			}`}
		></div>
	);
};

export default OnlineIndicator;
