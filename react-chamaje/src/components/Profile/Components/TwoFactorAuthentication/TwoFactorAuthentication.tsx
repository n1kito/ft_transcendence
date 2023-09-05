import React from 'react';
import './TwoFactorAuthentication.css';
import Window from 'src/components/Window/Window';

export interface TwoFactorAuthenticationProps {
	qrCode: string;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const TwoFactorAuthentication: React.FC<TwoFactorAuthenticationProps> = ({
	qrCode,
	windowDragConstraintRef,
	onCloseClick,
}) => {
	return (
		<Window
			windowTitle="Two-Factor Authentication"
			useBeigeBackground={true}
			onCloseClick={onCloseClick}
			key="two-factor-auth-window"
			windowDragConstraintRef={windowDragConstraintRef}
		>
			<div className="two-factor-auth-wrapper">hello</div>
		</Window>
	);
};

export default TwoFactorAuthentication;
