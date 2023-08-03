import React from 'react';
import './Button.css';

// TODO: the border around the button should be around the shadow as well, like on gandi

export interface MyButtonProps {
	baseColor?: number[];
	onClick?: () => void;
	children: React.ReactNode;
	disabled?: boolean;
}

const Button: React.FC<MyButtonProps> = ({
	baseColor = [57, 92, 66],
	onClick, // Set the default value to an empty function
	disabled = false,
	children,
}) => {
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

	console.log(buttonStyle.backgroundColor);

	const handleClick = () => {
		console.log('Button clicked');
		if (onClick) {
			onClick();
		}
	};

	return (
		<div
			className={`buttonWrapper ${disabled ? 'disabled-button' : ''}`}
			style={buttonStyle}
		>
			<button
				className="coloredButton"
				onClick={handleClick}
				disabled={disabled}
			>
				{children}
			</button>
		</div>
	);
};

export default Button;
