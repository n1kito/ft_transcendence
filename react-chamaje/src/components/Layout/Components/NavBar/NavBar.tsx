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
			<div className="menuItems">
				<span className={isAuthentificated ? '' : 'navBar-info-hidden'}>
					Miaou ?
				</span>
			</div>
			<div className="siteTitle">chamaje</div>
			<div className="toolBox">
				<span
					className={
						isAuthentificated && userData.login ? '' : 'navBar-info-hidden'
					}
				>
					{userData.login}
				</span>
				<FullscreenTrigger />
				<img
					className={`userAvatar ${
						!isAuthentificated || !userData.image ? 'navBar-info-hidden' : ''
					}`}
					src={userData.image}
				/>
				<span className={isAuthentificated ? '' : 'navBar-info-hidden'}>
					<Lock />
				</span>
				<Clock />
			</div>
		</div>
	);
};

export default NavBar;
