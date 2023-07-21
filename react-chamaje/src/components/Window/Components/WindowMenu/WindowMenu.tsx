import React from 'react';
import './WindowMenu.css';

interface WindowMenuProps {
	children: React.ReactNode;
}

const WindowMenu = ({ children }: WindowMenuProps) => {
	// TODO: figure out what type props should be
	return <div className="windowMenu">{children}</div>;
};

export default WindowMenu;
