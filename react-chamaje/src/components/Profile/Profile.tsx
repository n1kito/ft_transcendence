import React, { useContext } from 'react';
import './Profile.css';
import ProfilePicBadge from './Components/ProfilePicBadge/ProfilePicBadge';
import { UserContext } from '../../contexts/UserContext';
import placeholderImage from '../../images/placeholder-image.png';
import Title from './Components/Title/Title';
// import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
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
export interface ProfileProps {
	login: string;
}

const Profile: React.FC<ProfileProps> = (props) => {
	const { userData } = useContext(UserContext);

	return (
		<div className="profile-wrapper">
			<div className="profile-sidebar">
				<ProfilePicBadge
					picture={userData ? userData.image : placeholderImage}
					isModifiable={userData ? userData.login == props.login : false}
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
					<Button baseColor={[0, 80, 92]}>
						<svg
							className="trashcan-sgv"
							xmlns="http://www.w3.org/2000/svg"
							height="1em"
							viewBox="0 0 448 512"
						>
							<path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
						</svg>
					</Button>
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
