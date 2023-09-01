import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
// import Background from '../Background/Background';
import Window from '../Window/Window';
import Terminal from './Components/Terminal/Terminal';
import { motion } from 'framer-motion';
import Stickerparticles from './Components/Stickerparticles/Stickerparticles';
import useAuth from 'src/hooks/userAuth';

const Login = () => {
	const constraintRef = useRef(null);

	const [passkey, setPasskey] = useState('');
	const { isAuthentificated, TwoFAVerified, isTwoFAEnabled } = useAuth();
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

	useEffect(() => {
		console.log('\n\n👩🏽‍💻 User is authenticated: ', isAuthentificated);
		console.log('👩🏽‍💻 2FA has been enabled: ', isTwoFAEnabled)
		console.log('👩🏽‍💻 2FA has been verified: ', TwoFAVerified);
	}, [isAuthentificated, TwoFAVerified, isTwoFAEnabled]);

	return (
		<div id="wrapper">
			{/* <NavBar /> */}
			<motion.div id="content" ref={constraintRef}>
				<div id="prompt"></div>

				{passkey === 'omer' && !isAuthentificated && (
					<Window windowTitle="Login">
						{/* <Window windowTitle="Charlotte" links={links}> */}
						<Terminal
							instruction="Would you like to login with 42 ? (Y/n)"
							type="bool"
						/>
					</Window>
				)}

				{ isAuthentificated && isTwoFAEnabled &&  !TwoFAVerified && (
					<Window windowTitle="Login">
						{/* <Window windowTitle="Charlotte" links={links}> */}
						<Terminal instruction="Enter you Google code" type="input" />
					</Window>
				)}

				{passkey !== 'omer' && !isAuthentificated && (
					<div>
						type &quot;<b>omer</b>&quot; to login
					</div>
				)}
			</motion.div>
			<Stickerparticles />
		</div>
	);
};

export default Login;

// {(passkey === 'omer')? (
// 	<>
// 		<Window windowTitle="Login">
// 			{/* <Window windowTitle="Charlotte" links={links}> */}
// 			<Terminal instruction='Would you like to login with 42 ? (Y/n)' type='bool' />
// 		</Window>
// 	</>
// ) : (
// 	<>
// 		<div>
// 			type &quot;<b>omer</b>&quot; to login
// 		</div>
// 	</>
// )}
