import React, { useState } from 'react';
import './TwoFactorAuthentication.css';
import Window from 'src/components/Window/Window';
import Title from '../Title/Title';
import InputField from '../InputField/InputField';
import Button from 'src/components/Shared/Button/Button';
import useAuth from 'src/hooks/userAuth';

export interface TwoFactorAuthenticationProps {
	qrCode: string;
	// windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	// onCloseClick: () => void;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
	qrCode,
	// windowDragConstraintRef,
	// onCloseClick,
}) => {
	const [validationCode, setValidationCode] = useState('');
	const { accessToken } = useAuth();

	const handleInput = (newValidationCode: string) => {
		setValidationCode(newValidationCode);
	};

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
			} else {
				console.error('problemo: ', responseData);
			}
		} catch (error) {
			console.error(error);
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
				<div className="inputfield">
					<InputField
						value={validationCode}
						onChange={handleInput}
						type="2fa"
					/>
					<Button onClick={handleActivateButtonClick} disabled={false}>
						activate
					</Button>
				</div>
			</div>
		</div>
	);
};
// };

export default TwoFactorAuthentication;
