import React from 'react';
import './NavBar.css';
import Lock from './Components/Lock/Lock';
import Clock from './Components/Clock/Clock';

export interface navBarProps {
	isLoggedIn?: boolean;
}

const NavBar: React.FC<navBarProps> = ({ isLoggedIn = true }) => {
	const navClasses = 'navBar' + `${isLoggedIn ? ' loggedIn' : ''}`;
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
				<span>jeepark</span>
				<Lock />
				<Clock />
			</div>
		</div>
	);
};

export default NavBar;
