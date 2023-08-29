import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
// import Background from '../Background/Background';
import Window from '../Window/Window';
import Terminal from './Components/Terminal/Terminal';
import { motion } from 'framer-motion';
import Stickerparticles from './Components/Stickerparticles/Stickerparticles';

const Login = () => {
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
		<div id="wrapper">
			{/* <NavBar /> */}
			<motion.div id="content" ref={constraintRef}>
				<div id="prompt"></div>
				{passkey === 'omer' ? (
					<>
						<Window windowTitle="Login" onCloseClick={() => null}>
							{/* <Window windowTitle="Charlotte" links={links}> */}
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
	);
};

export default Login;
