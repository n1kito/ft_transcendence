import React from 'react';
import Lock from '../components/Layout/Components/NavBar/Components/Lock/Lock';
import Clock from '../components/Layout/Components/NavBar/Components/Clock/Clock';
import './Desktop.css';

const Desktop = () => {
	console.log('desktop component in the house');
	return (
		<div id="desktop">
			<div id="navBar">
				<div id="menuItems">
					{/* <Button></Button> */}
					<div>Link</div>
					<div>Link</div>
					<div>Link</div>
				</div>
				<div id="siteTitle">chamaje</div>
				<div id="toolBox">
					<Lock />
					<Clock />
				</div>
			</div>
		</div>
	);
};

export default Desktop;
