import React, { useEffect, useRef, useState } from 'react';
import Button from 'src/components/Shared/Button/Button';
import useAuth from 'src/hooks/userAuth';
import {
	logInTwoFactorAuthentication,
	turnOffTwoFactorAuthentication,
	turnOnTwoFactorAuthentication,
} from 'src/utils/TwoFactorAuthQueries';
import InputField from '../InputField/InputField';
import Title from '../Title/Title';
import './TwoFactorAuthentication.css';

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
		logInTwoFactorAuthentication(validationCode, accessToken)
			.then((data) => {
				// set 2fa to 'enabled'
				setIsTwoFAEnabled(true);
				// reset validation code error, just in case
				setValidationCodeError('');
				// set the authentication process as finished
				isProcessFinishedRef.current = true;
			})
			.catch((error) => {
				// set error to display it
				setValidationCodeError(error);
			});
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

	useEffect(() => {
		// On mount, turn on Two-Factor Authentication
		// generate a qr code
		turnOnTwoFactorAuthentication(accessToken).then((qrCodeUrl) => {
			// get QR code url from response
			// and update QrCode state
			setQrCode(qrCodeUrl);
		});

		return () => {
			// On unmount, if ever the process is not completed before
			// verifyin user's 2FA autentication (meaning validation code
			// is verified by google auth), turn off 2FA and close window
			if (!isProcessFinishedRef.current) {
				turnOffTwoFactorAuthentication(accessToken).then((data) => {
					setQrCode('');
					setIsTwoFAEnabled(false);
				});
				setTwoFactorAuthWindowisOpen(false);
			}
		};
	}, []);

	useEffect(() => {
		// Add a beforeunload event listener
		window.addEventListener('beforeunload', handlePageUnload);

		// Remove the event listener when the component unmounts
		return () => {
			window.removeEventListener('beforeunload', handlePageUnload);
		};
	}, []);

	const handlePageUnload = () => {
		// Call the API to turn off 2FA here
		if (!isProcessFinishedRef.current) {
			turnOffTwoFactorAuthentication(accessToken).then((data) => {
				setQrCode('');
				setIsTwoFAEnabled(false);
			});
		}
	};

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
						maxlength={6}
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
