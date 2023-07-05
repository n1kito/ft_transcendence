import React from 'react';
import './WindowMenu.css';

const WindowMenu = (props: any) => { // TODO: figure out what type props should be
	return <div id="windowMenu">{props.children}</div>;
};

export default WindowMenu;
