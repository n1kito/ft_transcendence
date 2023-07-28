import React, { useContext } from 'react';
import './NavBar.css';
import Lock from './Components/Lock/Lock';
import Clock from './Components/Clock/Clock';
import { UserContext } from '../../../../contexts/UserContext';
import FullscreenTrigger from './Components/FullscreenTrigger/FullscreenTrigger';
export interface navBarProps {
	isLoggedIn?: boolean;
}

const NavBar: React.FC<navBarProps> = ({ isLoggedIn = true }) => {
	const navClasses = 'navBar' + `${isLoggedIn ? ' loggedIn' : ''}`;
	const { userData } = useContext(UserContext);

	return (
		<div className={navClasses}>
			<div className="menuItems">
				{/* <Button></Button> */}
				<a href="#" title="Link name">
					Game
				</a>
				<a>Friends</a>
				<a>Settings</a>
			</div>
			<div className="siteTitle">chamaje</div>
			<div className="toolBox">
				<span>{userData ? userData.login : 'myLogin'}</span>
				<FullscreenTrigger />
				<img
					className="userAvatar"
					src={
						userData
							? userData.image
							: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Anna_Wintour_2019_crop_%28cropped%29.jpg'
					}
				/>
				<Lock />
				<Clock />
			</div>
		</div>
	);
};

export default NavBar;
