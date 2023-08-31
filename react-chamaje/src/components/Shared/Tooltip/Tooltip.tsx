import React, { ReactNode, useState } from 'react';
import './Tooltip.css';

// [ HOW TO USE ]
// The tooltip should be in a common div with the element it's "tooltiping"
// That parent div would have onMouseEnter set 	a isHovered state to true, and to false onMouseLeave
// The Tooltip's isVisible prop would be set to isHovered, so it will only appear when the sibling element is hovered.

interface ITooltipProps {
	children: ReactNode;
	tooltipTitle?: string;
	isVisible?: boolean;
	position?: string;
}

const Tooltip: React.FC<ITooltipProps> = ({
	tooltipTitle = '',
	children,
	isVisible = false,
	position = 'right',
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={`tooltip-wrapper tooltip-${position} ${
				isHovered || isVisible ? 'tooltip-visible' : ''
			}`}
			onMouseEnter={() => {
				console.log('tooltip is hovered');
				setIsHovered(true);
			}}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={`arrow arrow-tooltip-${position}`}></div>
			{tooltipTitle ? (
				<span className="tooltip-title">{tooltipTitle}</span>
			) : null}
			{/* This recognizes the \n characters in the description text and replaces them with a <br /> for html */}
			{typeof children === 'string'
				? children.split('\\n').map((line, index, array) => (
						<React.Fragment key={index}>
							{line}
							{index < array.length - 1 && <br />}
						</React.Fragment>
				  ))
				: children}
		</div>
	);
};

export default Tooltip;
