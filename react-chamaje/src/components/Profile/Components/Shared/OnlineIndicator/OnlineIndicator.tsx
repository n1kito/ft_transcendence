import React from 'react';
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
					: isOnline
						? 'status-indicator-is-online'
						: ''
			}`}
		></div>
	);
};

export default OnlineIndicator;
