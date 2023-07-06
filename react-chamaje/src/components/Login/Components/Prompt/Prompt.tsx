import React, { useEffect } from 'react';
import './Prompt.css';
import Typewriter from 'typewriter-effect';

interface PromptProps {
	instruction?: string;
	type?: string;
	redirUrl?: string;
}

const Prompt: React.FC<PromptProps> = ({
	instruction = 'instruction',
	type = 'input',
	redirUrl = '',
}) => {
	const labelWidth = instruction.length * 0.5;

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			const { key } = event;

			if (key == 'Y') window.open(redirUrl, '_self');
			else if (key == 'n') return;
			else console.log('user pressed something else');
		};

		if (type === 'bool') window.addEventListener('keydown', handleKeyPress);

		return () => {
			if (type === 'bool')
				window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	// if type is bool
	// if user inputs Y, redirect to redirUrl
	// if user inputs n, leave'

	return (
		<div id="prompt">
			<span>&#62;</span>
			<label style={{ minWidth: labelWidth + 'rem' }}>
				<Typewriter
					options={{
						strings: instruction,
						autoStart: true,
						loop: false,
						cursor: '',
						delay: 20,
					}}
				/>
			</label>
			<input></input>
			{/* <div className="typeCursor"></div> */}
		</div>
	);
};

export default Prompt;
