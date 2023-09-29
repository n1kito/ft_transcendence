import React from 'react';
import './WindowMenu.css';

interface WindowMenuProps {
	children: React.ReactNode;
}

const WindowMenu = ({ children }: WindowMenuProps) => {
	return <div className="windowMenu">{children}</div>;
};

export default WindowMenu;
