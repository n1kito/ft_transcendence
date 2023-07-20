import React, { ReactNode } from 'react';
import './Layout.css';
import Background from './Components/Background/Background';
import { Outlet } from 'react-router-dom';
import NavBar from './Components/NavBar/NavBar';
import useAuth from '../../hooks/userAuth';

export interface LayoutProps {
	children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { isAuthentificated } = useAuth();

	// TODO: figure out how to know if a user is logged in
	// the navBar style will update accordingly
	// document.getElementsByClassName('navBar')[0].classList.add('loggedIn');
	return (
		<div className="layoutWrapper">
			<NavBar isLoggedIn={isAuthentificated} />
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
