import React, { useContext } from 'react';
import './Profile.css';
import ProfilePicBadge from '../ProfilePicBadge/ProfilePicBadge';
import { UserContext } from '../../contexts/UserContext';
import placeholderImage from '../../images/placeholder-image.png'
import Title from './Components/Title/Title';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import ProfileSettings from './Components/ProfileSettings/ProfileSettings';

// TODO: find a way to make the shaddow wrapper widht's 100% so if fills the sidebar

const Profile = () => {
	const { userData } = useContext(UserContext);

	return <div className="profile-wrapper">
		<div className="profile-sidebar">
			<ProfilePicBadge picture={userData ? userData.image : placeholderImage}  />
			<Title bigTitle={true}>{userData? userData.login : 'pouet'}</Title>
			<ShadowWrapper shadow={true}>
				<Title>Titles</Title>
				<div className="placeholder-titles">
					<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
				</div>
			</ShadowWrapper>
			<ProfileSettings />
		</div>
		<div className="profile-content">content</div>
	</div>;
};

export default Profile;
