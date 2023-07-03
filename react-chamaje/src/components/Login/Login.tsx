import React, { useState, useEffect } from 'react';
import './Login.css';
import Background from '../Background/Background';
import { userEvent } from '@storybook/testing-library';

const Login = () => {
	const [input, setInput] = useState('');
	const [displayState, setDisplayState] = useState('block');
	const [failedAttempts, setFailedAttempts] = useState(0);

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.key.match(/^[a-z]$/) && input.length < 4) {
				setInput((prevInput) => {
					const newInput = prevInput + event.key;
					if (newInput.length === 4) {
						if (newInput !== 'omer') {
							setFailedAttempts((prevAttempts) => {
								switch (prevAttempts) {
									case 0:
										alert('we told you to type OMER');
										break;
									case 1:
										alert('are you dense ?');
										break;
								}
								setDisplayState('block');
								return prevAttempts + 1;
							});
							return '';
						} else {
							setTimeout(() => {
								setInput('logging in...');
								//send api request
								fetch('http://localhost:3000/login', {method:'GET'}).then((response) => response.json()).then(data => console.log(data));
							}, 500);
							return newInput;
						}
					}
					setDisplayState('none');
					return newInput;
				});
			}
		};

		document.addEventListener('keydown', handleKeyPress);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, []);
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
						<div id="inputText">
							<span id="placeHolder" style={{ display: displayState }}>
								type <b>omer</b> to login
							</span>
							{input}
						</div>
						<div id="cursor">_</div>
					</div>
				</div>
			</div>
			<Background></Background>
		</div>
	);
};

export default Login;
