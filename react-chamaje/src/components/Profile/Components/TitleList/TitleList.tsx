import React from 'react';
import './TitleList.css';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';
import Title from '../Title/Title';
import chickIcon from './icons/chick_icon.svg';
import cookieIcon from './icons/cookie_icon.svg';
import heartIcon from './icons/heart_icon.svg';
import skullIcon from './icons/skull_icon.svg';
import swordsIcon from './icons/swords_icon.svg';
import targetIcon from './icons/target_icon.svg';
import ripIcon from './icons/rip_icon.svg';
import kimonoIcon from './icons/kimono_icon.svg';

import AchievementBadge from '../AchievementBadge/AchievementBadge';
import { IUserData } from '../../../../../../shared-lib/types/user';

interface ITitleListProps {
	profileData: IUserData;
}

// TODO: I might want to use the userContext here instead of passing the data ?
const TitleList: React.FC<ITitleListProps> = ({ profileData }) => {
	return (
		<div className="title-list-wrapper">
			<ShadowWrapper shadow={true}>
				<div className="title-box-wrapper">
					<Title highlightColor="#FBD9F6">Titles</Title>
					<div className="titles-container">
						<AchievementBadge
							name="Rookie"
							description="You played your first game ! 🗡️"
							icon={chickIcon}
							achieved={(profileData?.gamesCount ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="Terminator 🦾"
							description="You have never lost a single game. 👁️👄👁️"
							icon={ripIcon}
							achieved={(profileData?.winRate ?? 0) == 100}
						></AchievementBadge>
						<AchievementBadge
							name="Tough cookie 🍪"
							description="You are hard to defeat, your killrate is insane !"
							icon={cookieIcon}
							achieved={(profileData?.winRate ?? 0) >= 100}
						></AchievementBadge>
						<AchievementBadge
							name="Padawan ✨"
							description="You have already won 10 games,\nthe force is obviously with you. 💅"
							icon={kimonoIcon}
							achieved={(profileData?.killCount ?? 0) >= 10}
						></AchievementBadge>
						<AchievementBadge
							name="Are you not entertained ? ⚔️"
							description="You have won 100 games, wow,\nI mean, come on now. 💪"
							icon={swordsIcon}
							achieved={(profileData?.killCount ?? 0) >= 100}
						></AchievementBadge>
						<AchievementBadge
							name="Thick as thieves"
							description="You have made a bestie 👯"
							icon={heartIcon}
							achieved={(profileData?.bestieLogin?.length ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="Kill Bill 💀"
							description="You have made an enemy. A mortal enemy 🤺"
							icon={skullIcon}
							achieved={(profileData?.rivalLogin?.length ?? 0) > 0}
						></AchievementBadge>
						<AchievementBadge
							name="John Wick"
							description="You have located your target.\nYour mission is to beat that target. 🎯"
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
