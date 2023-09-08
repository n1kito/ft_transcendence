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
}

const Prompt: React.FC<PromptProps> = ({
	instruction = 'instruction',
	type = 'input',
	redirUrl = '',
}) => {
	const { accessToken } = useAuth();
	const labelWidth = instruction.length * 0.5;

	const [validationCode, setValidationCode] = useState('');
	const [inputError, setInputError] = useState(false);
	const [fetchData, setFetchData] = useState(false);

	const navigate = useNavigate();

	const handleKeyPress = (event: KeyboardEvent) => {
		const { key } = event;

		if (key == 'Y') window.open(redirUrl, '_self');
		else if (key == 'n') return;
		else console.log('user pressed something else');
	};

	const checkInputFormat = (validationCode: string) => {
		console.log('\n\nCHECK validation code:', validationCode);
		// Check if validationCode contains only digits and is size 6
		return /^\d+$/.test(validationCode) && validationCode.length === 6;
	};

	const handleEnterKeyPress = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
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
			if (type === 'input')
				window.removeEventListener('keydown', handleEnterKeyPress);
		};
	}, []);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log('\ninput:', event.target.value);
		const inputValue = event.target.value;
		setValidationCode(inputValue);
		console.log('🧶validation code:', validationCode);
	};

	useEffect(() => {
		console.log('🧶validation code:', validationCode);
	}, [validationCode]);

	useEffect(() => {
		const fetchTwoFactorAuthLogin = async () => {
			try {
				console.log('🧶🧶🧶 fetching two factor login - code:', validationCode);
				const response = await fetch('/api/login/2fa/authenticate', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${accessToken}`,
					},
					body: JSON.stringify({ code: validationCode }),
				});
				const data = await response.json();
				if (response.ok) {
					console.log('response from /api/login/2fa:', data);
					navigate('/desktop');
				} else {
					console.log('problemo from /api/login/2fa: ', data);
				}
			} catch (error) {
				console.error(error);
			}
		};
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
								cursor: '',
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
						></input>
					)}
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
