import React, { useContext } from 'react';
import './MatchHistory.css';
import Title from '../Title/Title';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import MatchHistoryBadge from './Components/MatchHistoryBadge/MatchHistoryBadge';
import m3gan from '../../../../images/m3gan.jpg';
import { UserContext, UserData } from '../../../../contexts/UserContext';

interface IMatchHistoryProps {
	profileData: UserData;
}

const MatchHistory: React.FC<IMatchHistoryProps> = ({ profileData }) => {
	const { userData } = useContext(UserContext);
	const matchHistory = profileData.matchHistory;
	return (
		<div className="match-history-wrapper">
			<Title>Match History</Title>
			<ShadowWrapper>
				{matchHistory && matchHistory.length > 0 ? (
					<div className="history-badges">
						{matchHistory.map((match, index) => {
							const userIsPlayer1 = userData?.login === match.player1Login;
							const adversaryLogin = userIsPlayer1
								? match.player2Login
								: match.player1Login;
							const userScore = userIsPlayer1
								? match.player1Score
								: match.player2Score;
							const adversaryScore = userIsPlayer1
								? match.player2Score
								: match.player1Score;
							const adversaryImage = userIsPlayer1
								? match.player2Image
								: match.player1Image;
							return (
								<MatchHistoryBadge
									adversaryLogin={adversaryLogin}
									adversaryScore={adversaryScore}
									userScore={userScore}
									badgeImageUrl={adversaryImage}
									key={index}
								/>
							);
						})}
					</div>
				) : (
					<p>No matches played yet !</p>
				)}
			</ShadowWrapper>
		</div>
	);
};

export default MatchHistory;
