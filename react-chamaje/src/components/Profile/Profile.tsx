import React, { useContext } from 'react';
import './Profile.css';
import ProfilePicBadge from './Components/ProfilePicBadge/ProfilePicBadge';
import { UserContext } from '../../contexts/UserContext';
import placeholderImage from '../../images/placeholder-image.png';
import Title from './Components/Title/Title';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import ProfileSettings from './Components/ProfileSettings/ProfileSettings';
import ProfileStats from './Components/ProfileStats/ProfileStats';
import ProfileMissions from './Components/ProfileMissions/ProfileMissions';
import MatchHistory from './Components/MatchHistory/MatchHistory';
import TitleList from '../TitleList/TitleList';
import burgerIcon from './icons/burger-icon.svg';
import cdIcon from './icons/cd-icon.svg';
import coinsIcon from './icons/coins-icon.svg';
import computerIcon from './icons/computer-icon.svg';
import friesIcon from './icons/fries-icon.svg';
import giftIcon from './icons/gift-icon.svg';
import moneyIcon from './icons/money-icon.svg';
import rocketIcon from './icons/rocket-icon.svg';
import Button from '../Shared/Button/Button';

// TODO: find a way to make the shaddow wrapper widht's 100% so if fills the sidebar

const Profile = () => {
	const { userData } = useContext(UserContext);

	return (
		<div className="profile-wrapper">
			<div className="profile-sidebar">
				<ProfilePicBadge
					picture={userData ? userData.image : placeholderImage}
				/>
				<Title bigTitle={true}>{userData ? userData.login : 'pouet'}</Title>
				<TitleList>
					<img src={burgerIcon} />
					<img src={cdIcon} />
					<img src={coinsIcon} />
					<img src={computerIcon} />
					<img src={friesIcon} />
					<img src={giftIcon} />
					<img src={moneyIcon} />
					<img src={rocketIcon} />
				</TitleList>
				<ProfileSettings />
				<div className="profile-buttons">
					<Button baseColor={[308, 80, 92]}>change password</Button>
					<Button baseColor={[0, 80, 92]}>♥️♥️</Button>
				</div>
			</div>
			<div className="profile-content">
				<ProfileStats />
				<ProfileMissions />
				<MatchHistory />
			</div>
		</div>
	);
};

export default Profile;
