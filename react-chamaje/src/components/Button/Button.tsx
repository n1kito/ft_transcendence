import React from 'react';
import './Button.css';

// TODO: the border around the button should be around the shadow as well, like on gandi

export interface MyButtonProps {
	buttonText?: string;
	baseColor?: number[];
}

const Button: React.FC<MyButtonProps> = ({
	buttonText = 'default',
	baseColor = [57, 92, 66],
}) => {
	// Convert the baseColor array to an rgb color string
	const btnBgColor = `hsl(${baseColor[0]}, ${baseColor[1]}%, ${baseColor[2]}%)`;
	const btnTxtColor = `hsl(${baseColor[0]}, ${baseColor[1]}%, ${baseColor[2] - 70}%)`;
	// Calculate darker and lighter shades of your base color.
	// This is a simple example, you might want to use a more sophisticated method.
	const btnBorderColor = `hsl(${baseColor[0]}, ${baseColor[1] + 30}%, ${baseColor[2] - 5}%)`;
	const btnShadowColor = `hsl(${baseColor[0]}, ${baseColor[1]}%, ${baseColor[2] - 50}%, 30%)`;

	const buttonStyle = {
		'--btnBgColor': btnBgColor,
		'--btnTxtColor': btnTxtColor,
		'--btnBorderColor': btnBorderColor,
		'--btnShadowColor': btnShadowColor,
	} as React.CSSProperties;

	console.log(buttonStyle.backgroundColor);
	return (
		<div>
			<div id="buttonWrapper" style={buttonStyle}>
				<button id="coloredButton">{buttonText}</button>
			</div>
		</div>
	);
};

export default Button;
