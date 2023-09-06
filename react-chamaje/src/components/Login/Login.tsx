import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
// import Background from '../Background/Background';
import Window from '../Window/Window';
import Terminal from './Components/Terminal/Terminal';
import { motion } from 'framer-motion';
import Stickerparticles from './Components/Stickerparticles/Stickerparticles';
import useAuth from 'src/hooks/userAuth';

const Login = ({}) => {
	const constraintRef = useRef(null);

	const [passkey, setPasskey] = useState('');
	const { isAuthentificated, isTwoFAVerified, isTwoFAEnabled } = useAuth();
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
		<div id="wrapper">
			{/* <NavBar /> */}
			<motion.div id="content" ref={constraintRef}>
				<div id="prompt"></div>

				{passkey === 'omer' && !isAuthentificated && (
					<Window windowTitle="Login" onCloseClick={() => null}>
						<Terminal
							instruction="Would you like to login with 42 ? (Y/n)"
							type="bool"
							redirUrl="api/login/auth"
						/>
					</Window>
				)}

				{isAuthentificated && isTwoFAEnabled && !isTwoFAVerified && (
					<Window windowTitle="Login" onCloseClick={() => null}>
						<Terminal
							instruction="Enter you Google code"
							type="input"
							redirUrl="api/login/2fa/authenticate"
						/>
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
