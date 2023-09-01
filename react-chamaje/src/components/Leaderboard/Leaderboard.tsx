import React from 'react';
import './Leaderboard.css';
import { IPrivateMessagesProps } from '../PrivateMessages/PrivateMessages';
import Window from '../Window/Window';
import LeaderboardCard from './Components/LeaderboardCard/LeaderboardCard';

const Leaderboard: React.FC<IPrivateMessagesProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	// TODO: get leaderboard information as an array
	return (
		<Window
			windowTitle="Leaderboard"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="leaderboard-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<div className="leaderboard-wrapper">
				<LeaderboardCard />
			</div>
		</Window>
	);
};

export default Leaderboard;
