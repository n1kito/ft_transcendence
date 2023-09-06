import React, { useEffect, useState } from 'react';
import './Terminal.css';
import Prompt from '../Prompt/Prompt';

interface TerminalProps {
	instruction: string;
	type: string;
	redirUrl: string;
}

const Terminal: React.FC<TerminalProps> = (props) => {
	return (
		<div id="terminal">
			<Prompt
				instruction={props.instruction}
				type={props.type}
				redirUrl={props.redirUrl}
			></Prompt>
			{/* <Prompt instruction='Please input your email:'></Prompt> */}
			{/* <Prompt instruction='enter your password:'></Prompt> */}
		</div>
	);
};

export default Terminal;
