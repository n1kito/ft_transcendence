import React from 'react';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import Title from '../Title/Title';
import './TitleList.css';
import chickIcon from './icons/chick_icon.svg';
import cookieIcon from './icons/cookie_icon.svg';
import heartIcon from './icons/heart_icon.svg';
import kimonoIcon from './icons/kimono_icon.svg';
import ripIcon from './icons/rip_icon.svg';
import skullIcon from './icons/skull_icon.svg';
import swordsIcon from './icons/swords_icon.svg';
import targetIcon from './icons/target_icon.svg';

import { IUserData } from '../../../../../../shared-lib/types/user';
import AchievementBadge from '../AchievementBadge/AchievementBadge';

interface ITitleListProps {
	profileData: IUserData;
}

const TitleList: React.FC<ITitleListProps> = ({ profileData }) => {
	return (
		<div className="title-list-wrapper">
			<ShadowWrapper shadow={true}>
				<div className="title-box-wrapper">
					<Title highlightColor="#FBD9F6">Badges</Title>
					<div className="titles-container">
						<AchievementBadge
							name="Rookie"
							description="Played one game ! 🗡️"
							icon={chickIcon}
							achieved={(profileData?.gamesCount ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="Terminator 🦾"
							description="Never lost a single game. 👁️👄👁️"
							icon={ripIcon}
							achieved={(profileData?.winRate ?? 0) == 100}
						></AchievementBadge>
						<AchievementBadge
							name="Tough cookie 🍪"
							description="Hard to defeat, the winrate is insane ! (> 90%)"
							icon={cookieIcon}
							achieved={(profileData?.winRate ?? 0) >= 100}
						></AchievementBadge>
						<AchievementBadge
							name="Padawan ✨"
							description="Already won 10 games,\nthe force is obviously here somewhere. 💅"
							icon={kimonoIcon}
							achieved={(profileData?.killCount ?? 0) >= 10}
						></AchievementBadge>
						<AchievementBadge
							name="Are you not entertained ? ⚔️"
							description="Won 100 games, wow, I mean, come on now. 💪"
							icon={swordsIcon}
							achieved={(profileData?.killCount ?? 0) >= 100}
						></AchievementBadge>
						<AchievementBadge
							name="Thick as thieves"
							description="Made a bestie 👯"
							icon={heartIcon}
							achieved={(profileData?.bestieLogin?.length ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="Kill Bill 💀"
							description="Made an enemy. A mortal enemy 🤺"
							icon={skullIcon}
							achieved={(profileData?.rivalLogin?.length ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="John Wick"
							description="Target located.\nThe mission is to beat that target. 🎯"
							icon={targetIcon}
							achieved={profileData?.targetDiscoveredByUser || false}
						></AchievementBadge>
					</div>
				</div>
			</ShadowWrapper>
		</div>
	);
};

export default TitleList;
