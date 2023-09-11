import React, { ReactNode, useEffect, useState } from 'react';
import './TwoFactorAuthentication.css';
import Window from 'src/components/Window/Window';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import Button from 'src/components/Shared/Button/Button';
import useAuth from 'src/hooks/userAuth';
import ShadowWrapper from 'src/components/Shared/ShadowWrapper/ShadowWrapper';

export interface TwoFactorAuthenticationProps {
	qrCode: string;
	setQrCode: React.Dispatch<React.SetStateAction<string>>;
	setTwoFactorAuthWindowisOpen: React.Dispatch<React.SetStateAction<boolean>>;
	// children: ReactNode;
	// windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	// onCloseClick: () => void;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
	qrCode,
	setQrCode,
	setTwoFactorAuthWindowisOpen,
	// windowDragConstraintRef,
	// onCloseClick,
}) => {
	const { accessToken, setIsTwoFAEnabled, isTwoFAEnabled } = useAuth();
	const [validationCode, setValidationCode] = useState('');
	const [inputError, setInputError] = useState(true);
	const [validationCodeError, setValidationCodeError] = useState('');

	const [isProcessFinished, setIsProcessFinished] = useState(false);

	const handleActivateButtonClick = async () => {
		console.log('🍉 handle activate button click: ', validationCode);
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
			const responseData = await response.json();
			if (response.ok) {
				alert('code is valid!');
				setIsTwoFAEnabled(true);
				setValidationCodeError('');
				setIsProcessFinished(true);
			} else {
				console.error('problemo: ', responseData);
				setValidationCodeError('Invalid two-factor code');
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

	useEffect(() => {
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
					const data = await response.text();
					setQrCode(data);

					console.log('2FA enabled QR CODE : ', qrCode);
				}
			} catch (error) {
				console.error('2fa: ', error);
			}
		};
		turnOn2fa();
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
