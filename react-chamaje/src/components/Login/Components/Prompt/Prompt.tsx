import React, { useEffect, useState } from 'react';
import './Prompt.css';
import Typewriter from 'typewriter-effect';
import useAuth from 'src/hooks/userAuth';

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

	const handleKeyPress = (event: KeyboardEvent) => {
		const { key } = event;

		if (key == 'Y') window.open(redirUrl, '_self');
		else if (key == 'n') return;
		else console.log('user pressed something else');
	};
	useEffect(() => {
		if (type === 'bool') window.addEventListener('keydown', handleKeyPress);

		return () => {
			if (type === 'bool')
				window.removeEventListener('keydown', handleKeyPress);
		};
	}, []);

	const handleValidationCode = (event: KeyboardEvent) => {
		const { key } = event;
		console.log(
			'🥲 event: ',
			event,
			'\nkey: ',
			key,
			'\nvalidationCode: ',
			validationCode,
		);

		// check if not digit
		if (/^\d$/.test(key) === false) {
			setInputError(true);
			setValidationCode('');
		}

		const updatedValidationCode =
			validationCode.slice(-validationCode.length) + event.key;
		console.log('updated validation code: ', updatedValidationCode);
		setValidationCode(updatedValidationCode);
		// console.log('🥲 validation code after: ', validationCode);
	};

	useEffect(() => {
		if (type === 'input')
			window.addEventListener('keydown', handleValidationCode);

		console.log('🥲 code: ', validationCode);
		// Send a request when validationCode length reaches 6
		if (validationCode.length === 6) {
			// check if validation code is only digit
			if (/^\d{6}$/.test(validationCode)) {
				// Send the request when validationCode is 6 digits composed of only digits
				const fetchData = async (validationCode: string) => {
					console.log('Sending request to /api/2fa/', validationCode);
					try {
						const response = await fetch('/api/login/2fa', {
							method: 'POST',
							credentials: 'include',
							headers: {
								Authorization: `Bearer ${accessToken}`,
							},
							body: JSON.stringify({ twoFactorAuthCode: validationCode }),
						});
					} catch (error) {
						console.error(error);
					}
				};

				fetchData(validationCode);
				setValidationCode('');
			} else {
				// Handle the case where validationCode is not 6 digits or contains non-digits
				console.log('Validation code is not valid');
				setValidationCode('');
			}
		}
		return () => {
			if (type === 'input')
				window.removeEventListener('keydown', handleValidationCode);
			// setValidationCode('');
		};
	}, [validationCode]);

	// if type is bool
	// if user inputs Y, redirect to redirUrl
	// if user inputs n, leave'

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
					<input maxLength={6}></input>
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
