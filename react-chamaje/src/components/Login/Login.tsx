import React from 'react';
import './Login.css';
import Background from '../Background/Background';
import Button from '../Button/Button';

const Login = () => {
	return (
		<div>
			<div id="wrapper">
				<div id="navBar">
					<div id="menuItems">
						{/* <Button></Button> */}
						<div>Link</div>
						<div>Link</div>
						<div>Link</div>
					</div>
					<div id="siteTitle">chamaje</div>
					<div id="toolBox">
						<div id="lock">lock</div>
						<div id="time">17:37</div>
					</div>
				</div>
				<div id="content">
					<div id="inputField">
						type <b>“omer”</b> to login
					</div>
				</div>
			</div>
			<Background></Background>
		</div>
	);
};

export default Login;
