import React, { useContext } from 'react';
import './NavBar.css';
import Lock from './Components/Lock/Lock';
import Clock from './Components/Clock/Clock';
import { UserContext } from '../../../../contexts/UserContext';
import FullscreenTrigger from './Components/FullscreenTrigger/FullscreenTrigger';
import useAuth from 'src/hooks/userAuth';
export interface navBarProps {
	isLoggedIn?: boolean;
}

// modified image display when loading page and when login page state

const NavBar: React.FC<navBarProps> = ({ isLoggedIn = true }) => {
	const { userData } = useContext(UserContext);
	const { isAuthentificated } = useAuth();

	return (
		<div className={`navBar ${isLoggedIn ? 'loggedIn' : ''}`}>
			<div className="menuItems">Miaou ?</div>
			<div className="siteTitle">chamaje</div>
			<div className="toolBox">
				{userData && <span>{userData.login}</span>}
				<FullscreenTrigger />
				{isAuthentificated && (
					<img className="userAvatar" src={userData.image} />
				)}
				{isAuthentificated && <Lock />}
				<Clock />
			</div>
		</div>
	);
};

export default NavBar;
