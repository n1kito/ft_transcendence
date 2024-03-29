import React from 'react';
import './Button.css';

export interface MyButtonProps {
	baseColor?: number[];
	onClick?: () => void;
	children: React.ReactNode;
	disabled?: boolean;
}

const Button: React.FC<MyButtonProps> = ({
	baseColor = [57, 92, 66],
	onClick,
	disabled = false,
	children,
}) => {
	const buttonClass = disabled ? 'disabled' : '';

	// Convert the baseColor array to an rgb color string
	const btnBgColor = disabled
		? 'hsl(0, 0%, 70%)'
		: `hsl(${baseColor[0]}, ${baseColor[1]}%, ${baseColor[2]}%)`;
	const btnTxtColor = `hsl(${baseColor[0]}, ${baseColor[1]}%, ${
		baseColor[2] - 70
	}%)`;
	// Calculate darker and lighter shades of your base color.
	// This is a simple example, you might want to use a more sophisticated method.
	const btnBorderColor = disabled
		? 'hsl(0, 0%, 50%)'
		: `hsl(${baseColor[0]}, ${baseColor[1] + 30}%, ${baseColor[2] - 5}%)`;

	const btnShadowColor = disabled
		? 'hsl(0, 0%, 60%)'
		: `hsl(${baseColor[0]}, ${baseColor[1]}%, ${baseColor[2] - 20}%, 60%)`;

	const buttonStyle = {
		'--btnBgColor': btnBgColor,
		'--btnTxtColor': btnTxtColor,
		'--btnBorderColor': btnBorderColor,
		'--btnShadowColor': btnShadowColor,
		// '--paddingBottom': disabled ? '0' : 'initial',
		// '--marginTop': disabled ? '0.5rem' : 'initial',
	} as React.CSSProperties;

	const handleClick = () => {
		if (!disabled && onClick) {
			onClick();
		}
	};

	return (
		<div
			onClick={handleClick}
			className={`button-wrapper ${buttonClass} ${
				disabled ? 'button-disabled' : ''
			}`}
			style={buttonStyle}
		>
			<button className="colored-button">{children}</button>
		</div>
	);
};

export default Button;
