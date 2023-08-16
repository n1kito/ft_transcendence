import React from 'react';
import './MatchHistory.css';
import Title from '../Title/Title';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import MatchHistoryBadge from './Components/MatchHistoryBadge/MatchHistoryBadge';
import m3gan from '../../../../images/m3gan.jpg';

const MatchHistory = () => {
	return (
		<div className="match-history-wrapper">
			<Title>Match History</Title>
			<ShadowWrapper>
				<div className="history-badges">
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={5}
						userScore={8}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={8}
						userScore={5}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
					<MatchHistoryBadge
						badgeTitle="@jeepark"
						adversaryScore={5}
						userScore={8}
						badgeImageUrl={m3gan}
					></MatchHistoryBadge>
				</div>
			</ShadowWrapper>
		</div>
	);
};

export default MatchHistory;
