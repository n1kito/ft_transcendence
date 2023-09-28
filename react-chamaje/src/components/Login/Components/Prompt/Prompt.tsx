import React, { useEffect, useState } from 'react';
import './Prompt.css';
import Typewriter from 'typewriter-effect';
import useAuth from 'src/hooks/userAuth';
import { keyboardKey } from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

interface PromptProps {
	instruction?: string;
	type?: string;
	redirUrl?: string;
	activePrompt?: boolean;
}

const Prompt: React.FC<PromptProps> = ({
	instruction = 'instruction',
	type = 'input',
	redirUrl = '',
	activePrompt = true,
}) => {
	const { accessToken } = useAuth();
	const labelWidth = instruction.length * 0.5;

	const [validationCode, setValidationCode] = useState('');
	const [inputError, setInputError] = useState(false);
	const [fetchData, setFetchData] = useState(false);

	const navigate = useNavigate();

	/**************************************************************************************/
	/* 42 API login                                                    					  */
	/**************************************************************************************/

	// handle keyboard event for 42 api login process
	const handleBoolKeyPress = (event: KeyboardEvent) => {
		const { key } = event;
		// If 'yes', open a new window with the specified URL in the same tab
		if (key == 'Y') window.open(redirUrl, '_self');
		// If 'n', do nothing
		else if (key == 'n') return;
	};

	// when mounting add an event listener for 42 api login process
	useEffect(() => {
		if (type === 'bool') window.addEventListener('keydown', handleBoolKeyPress);
		return () => {
			// remove the event listener on unmount
			if (type === 'bool')
				window.removeEventListener('keydown', handleBoolKeyPress);
		};
	}, []);

	/**************************************************************************************/
	/* two-factor Authentication login                                                    */
	/**************************************************************************************/

	// Update the 'validationCode' state with the input value
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValidationCode(event.target.value);
	};

	// setup an effect to add an event listener
	useEffect(() => {
		if (type === 'input')
			window.addEventListener('keydown', handleEnterKeyPress);
		return () => {
			if (type === 'input')
				window.removeEventListener('keydown', handleEnterKeyPress);
		};
	}, []);

	// Check if `validationCode` is only digit and has a length of 6
	const checkInputFormat = (validationCode: string) => {
		return /^\d+$/.test(validationCode) && validationCode.length === 6;
	};

	// Set 'fetchData' flag to true when Enter key is pressed
	const handleEnterKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			setFetchData(true);
		}
	};

	// on `validation code` submit, fetch two-factor authentication login data
	// to verify it. If the code is valid, navigate to `/desktop`
	useEffect(() => {
		const fetchTwoFactorAuthLogin = async () => {
			try {
				const response = await fetch('/api/login/2fa/authenticate', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${accessToken}`,
					},
					// send the validation code to verify it
					body: JSON.stringify({ twoFactorAuthenticationCode: validationCode }),
				});
				const data = await response.json();
				if (response.ok) {
					navigate('/desktop');
				} else {
					console.error('error with two-factor authentication: ', data);
				}
			} catch (error) {
				console.error(error);
			}
		};
		// if user has typed `Enter` and the validation code format is valid,
		// fetch request
		if (fetchData && checkInputFormat(validationCode))
			fetchTwoFactorAuthLogin();
		setFetchData(false);
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
								// cursor: `${activePrompt ? '|' : ''}`,
								delay: 20,
							}}
						/>
					</label>
					{type === 'bool' && <input></input>}
					{type === 'input' && (
						<input
							className="prompt-input"
							maxLength={6}
							type="text"
							inputMode="numeric"
							pattern="[0-9]{6}"
							value={validationCode}
							onChange={handleInputChange}
							required
							autoFocus
							style={{
								fontFamily: 'Courier New',
								fontSize: '0.8rem',
							}}
						></input>
					)}
				</div>

				{/* <div className="typeCursor"></div> */}
			</div>
		</div>
	);
};

export default Prompt;
