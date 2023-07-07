import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
// import Background from '../Background/Background';
import Window from '../Window/Window';
import Terminal from './Components/Terminal/Terminal';
import Clock from '../Clock/Clock';
import Lock from '../Lock/Lock';
import { motion } from 'framer-motion';
import Stickerparticles from '../Stickerparticles/Stickerparticles';

const Login = () => {
	// const [input, setInput] = useState('');
	// const [displayState, setDisplayState] = useState('block');
	// const [failedAttempts, setFailedAttempts] = useState(0);

	// useEffect(() => {
	// const handleKeyPress = (event: KeyboardEvent) => {
	// 	if (event.key.match(/^[a-z]$/) && input.length < 4) {
	// 		setInput((prevInput) => {
	// 			const newInput = prevInput + event.key;
	// 			if (newInput.length === 4) {
	// 				if (newInput !== 'omer') {
	// 					// 	setFailedAttempts((prevAttempts) => {
	// 					// 		switch (prevAttempts) {
	// 					// 			case 0:
	// 					// 				alert('we told you to type OMER');
	// 					// 				break;
	// 					// 			case 1:
	// 					// 				alert('are you dense ?');
	// 					// 				break;
	// 					// 		}
	// 					// 		setDisplayState('block');
	// 					// 		return prevAttempts + 1;
	// 					// });
	// 					return '';
	// 				} else {
	// 					setTimeout(() => {
	// 						setInput('logging in...');
	// 					}, 500);
	// 					return newInput;
	// 				}
	// 			}
	// 			setDisplayState('none');
	// 			return newInput;
	// 		});
	// 	}
	// };

	// document.addEventListener('keydown', handleKeyPress);

	// return () => {
	// document.removeEventListener('keydown', handleKeyPress);
	// };
	// }, []);

	// Add links to the menu using the "links" property
	// const links: MenuLinks[] = [
	// 	{ name: 'Link 0', url: 'http://www.42.fr' },
	// 	{ name: 'Link 1', url: 'http://www.42.fr' },
	// 	{ name: 'Link 2', url: 'http://www.42.fr' },
	// ];

	const constraintRef = useRef(null);

	const [passkey, setPasskey] = useState('');
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const updatedPasskey = passkey.slice(-3) + event.key;
			setPasskey(updatedPasskey);
		};
		document.addEventListener('keydown', handleKeyDown);

		if (passkey === 'omer')
			document.removeEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [passkey]);

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
						<Lock />
						<Clock />
					</div>
				</div>
				<motion.div id="content" ref={constraintRef}>
					<div id="prompt"></div>
					{passkey === 'omer' ? (
						<>
							<Window windowTitle="Login">
								<Terminal />
							</Window>
						</>
					) : (
						<>
							<div>
								type &quot;<b>omer</b>&quot; to login
							</div>
						</>
					)}
				</motion.div>
				<Stickerparticles />
			</div>
			{/* <Background /> */}
		</div>
	);
};

export default Login;
