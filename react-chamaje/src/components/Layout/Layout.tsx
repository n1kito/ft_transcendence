import React, { ReactNode } from 'react';
import './Layout.css';
import Background from './Components/Background/Background';
import { Outlet } from 'react-router-dom';
import NavBar from './Components/NavBar/NavBar';

export interface LayoutProps {
	children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	// TODO: figure out how to know if a user is logged in
	// the navBar style will update accordingly
	const isLoggedIn = false;
	console.log('logged in:' + isLoggedIn);
	// document.getElementsByClassName('navBar')[0].classList.add('loggedIn');
	return (
		<div className="layoutWrapper">
			<NavBar isLoggedIn={true} />
			{/* <div class="layoutContent"> */}
			<div className="layoutChildren">
				{children}
				<Outlet />
			</div>
			{/* </div> */}
			<Background />
		</div>
	);
};

export default Layout;
