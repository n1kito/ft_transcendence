import React, { ReactNode } from 'react';
import './Layout.css';
import Background from '../Background/Background';
import { Outlet } from 'react-router-dom';

export interface LayoutProps {
	children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div id="layout">
			{children}
			<Outlet />
			<Background />
		</div>
	);
};

export default Layout;
