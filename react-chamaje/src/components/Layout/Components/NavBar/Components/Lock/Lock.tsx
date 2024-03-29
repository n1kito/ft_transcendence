import React, { useContext } from 'react';
import './Lock.css';
import useAuth from 'src/hooks/userAuth';
import { ChatContext } from 'src/contexts/ChatContext';

const Lock = () => {
	const { chatData } = useContext(ChatContext);
	const { logOut } = useAuth();

	const handleClick = () => {
		logOut();
		chatData.socket?.endConnection();
		// userData?.chatSocket?.endConnection();
	};
	return (
		<div id="lockWrapper" title="Click to log out" onClick={handleClick}>
			<svg
				id="lockIcon"
				data-name="Layer 2"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 26.71 36.69"
			>
				<g id="Body">
					<rect
						className="lockBody"
						y="14.41"
						width="26.71"
						height="22.28"
						rx="2.37"
						ry="2.37"
					/>
				</g>
				<g id="Head">
					<path
						className="lockHead"
						d="m21.64,14.41v-4.8c0-4.48-3.4-8.11-7.6-8.11h-1.38c-4.19,0-7.6,3.63-7.6,8.11v4.8"
					/>
				</g>
			</svg>
		</div>
	);
};

export default Lock;
