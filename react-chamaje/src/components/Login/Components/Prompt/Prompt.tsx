import React, { useEffect, useState } from 'react';
import './Prompt.css';
import Typewriter from 'typewriter-effect';
import useAuth from 'src/hooks/userAuth';
import { keyboardKey } from '@testing-library/user-event';

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
	const [validationCode, setValidationCode] = useState('');
	const [inputError, setInputError] = useState(false);
	const { accessToken } = useAuth();
	const [fetchData, setFetchData] = useState(false);

	const handleKeyPress = (event: KeyboardEvent) => {
		const { key } = event;

		if (key == 'Y') window.open(redirUrl, '_self');
		else if (key == 'n') return;
		else console.log('user pressed something else');
	};

	const handleEnterKeyPress = (event: KeyboardEvent) => {
		// const { key } = event;

		if (event.key === 'Enter') {
			console.log('user typed ENTER');
			setFetchData(true);
		}
	};

	useEffect(() => {
		if (type === 'bool') window.addEventListener('keydown', handleKeyPress);

		if (type === 'input')
			window.addEventListener('keydown', handleEnterKeyPress);
		return () => {
			if (type === 'bool')
				window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log('\ninput:', event.target.value);
		const inputValue = event.target.value;
		setValidationCode(inputValue);
		if (inputValue.length === 6) {
			setFetchData(true);
		} else {
			setFetchData(false);
		}
	};

	useEffect(() => {
		if (fetchData) {
			console.log('INPUT IS COMPLETE');
			const fetchTwoFactorAuthLogin = async () => {
				try {
					console.log('🧶🧶🧶 fetching two factor login');
					const response = await fetch('/api/login/2fa', {
						method: 'POST',
						credentials: 'include',
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
						body: JSON.stringify({ twoFactorAuthCode: validationCode }),
					});
					const data = await response.json();
					if (response.ok) {
						console.log('response from /api/login/2fa:', data);
					} else console.log('problemo from /api/login/2fa: ', data);
				} catch (error) {
					console.error(error);
				}
				// Reset the fetchData flag to false after making the request
				setFetchData(false);
			};
		}
	}, [fetchData]);

	return (
		<div id="prompt-wrapper">
			<div className="line1">
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
					<input
						className="prompt-input"
						maxLength={6}
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						value={validationCode}
						onChange={handleInputChange}
					></input>
				</div>
				<div className="line2">
					{inputError === true && (
						<div id="msg-error">
							<label style={{ minWidth: labelWidth + 'rem' }}>
								<Typewriter
									options={{
										strings: '> Code must be only digit!',
										autoStart: true,
										loop: false,
										cursor: '',
										delay: 20,
									}}
								/>
							</label>
						</div>
					)}
				</div>

				{/* <div className="typeCursor"></div> */}
			</div>
		</div>
	);
};

export default Prompt;
