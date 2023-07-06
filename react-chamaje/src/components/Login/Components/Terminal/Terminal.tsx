import React from 'react';
import './Terminal.css';
import Prompt from '../Prompt/Prompt';

const Terminal = () => {
	return (
		<div id="terminal">
			<Prompt
				instruction="Would you like to login with 42 ? (Y/n)"
				type="bool"
				redirUrl="http://www.42.fr"
			></Prompt>
			{/* <Prompt instruction='Please input your email:'></Prompt> */}
			{/* <Prompt instruction='enter your password:'></Prompt> */}
		</div>
	);
};

export default Terminal;
