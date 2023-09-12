import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './TwoFactorAuthentication.css';
import Window from 'src/components/Window/Window';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import Button from 'src/components/Shared/Button/Button';
import useAuth from 'src/hooks/userAuth';
import ShadowWrapper from 'src/components/Shared/ShadowWrapper/ShadowWrapper';

export interface TwoFactorAuthenticationProps {
	setTwoFactorAuthWindowisOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
	setTwoFactorAuthWindowisOpen,
}) => {
	const { accessToken, setIsTwoFAEnabled } = useAuth();
	const [validationCode, setValidationCode] = useState('');
	const [inputError, setInputError] = useState(true);
	const [validationCodeError, setValidationCodeError] = useState('');
	const [qrCode, setQrCode] = useState('');
	const isProcessFinishedRef = useRef(false);

	// On `Activate` button click, send request to authenticate with 2fa
	// with the validation code given by google authenticator after scanning
	// the QR code.
	const handleActivateButtonClick = async () => {
		try {
			const response = await fetch('/api/login/2fa/authenticate', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ code: validationCode }),
			});
			if (response.ok) {
				const responseData = await response.json();
				// set 2fa to 'enabled'
				setIsTwoFAEnabled(true);
				// reset validation code error, just in case
				setValidationCodeError('');
				// set the authentication process as finished
				isProcessFinishedRef.current = true;
			} else {
				// if validation code error is invalid, set
				// `ValidationCodeError` state to display
				// error message
				const responseData = await response.json();
				setValidationCodeError(responseData.message);
			}
		} catch (error) {
			console.error(error);
		}
	};

	// Handle input state: disable the 'activate' button in case
	// of invalid input
	const handleInput = (newValidationCode: string) => {
		// Save keyboard event is ValidationCodeState
		setValidationCode(newValidationCode);

		// test if input is only digit
		const isDigitOnly = /^[0-9]+$/.test(newValidationCode);

		// if input is not valid set InputError to true
		if (!newValidationCode || newValidationCode.length < 6 || !isDigitOnly)
			setInputError(true);
		// else validate input
		else setInputError(false);
	};

	// fetch request to turn on 2FA mode : generate google auth secret and
	// enable 2fa status (boolean). Infos are kept in database until user
	// decides to turn it off.
	// RETURN : generated QR Code with google auth secret and user's payload
	const turnOn2fa = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-on', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				// retrieve QR code url from response
				const qrCodeUrl = await response.text();
				// and update qrCode state
				setQrCode(qrCodeUrl);
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};

	// fetch request to turn off 2FA mode : remove google auth secret and
	// fisable 2FA status
	const turnOff2fa = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-off', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				// if success, clean states managing 2FA mode
				setQrCode('');
				setIsTwoFAEnabled(false);
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};

	useEffect(() => {
		// On mount, turn on 2FA
		turnOn2fa();

		return () => {
			// alert();
			// On unmount, if ever the process is not completed before
			// verifyin user's 2FA autentication (meaning validation code
			// is verified by google auth), turn off 2FA and close window
			if (!isProcessFinishedRef.current) {
				// alert();

				turnOff2fa();
				setTwoFactorAuthWindowisOpen(false);
			}
		};
	}, []);

	return (
		<div className="two-factor-auth-wrapper">
			<div className="qr-code">
				<Title bigTitle={false}>Scan the QR code</Title>
				<img src={qrCode} />
			</div>
			<div className="validation-code">
				<Title bigTitle={false}>Enter the 6-digit code</Title>
				<div className="validation-code-form">
					<InputField
						value={validationCode}
						onChange={handleInput}
						error={validationCodeError}
						type="2fa"
					/>
					<Button onClick={handleActivateButtonClick} disabled={inputError}>
						activate
					</Button>
				</div>
			</div>
		</div>
	);
};
// };

export default TwoFactorAuthentication;
