import React from 'react';
import './PowerUpButton.css';

interface IPowerUpButtonProps {
	children?: React.ReactNode;
	pressed: boolean;
}

const PowerUpButton: React.FC<IPowerUpButtonProps> = ({
	children,
	pressed = false,
}) => {
	return (
		<div
			className={`power-up-button-wrapper ${
				pressed ? 'power-up-button-pressed' : ''
			}`}
		>
			<span>{children}</span>
		</div>
	);
};

export default PowerUpButton;
