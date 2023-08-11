import React, { ReactNode } from 'react';
import './Tooltip.css';

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
	return (
		<div
			className={`tooltip-wrapper tooltip-${position} ${
				isVisible ? 'tooltip-visible' : ''
			}`}
		>
			<div className={`arrow arrow-tooltip-${position}`}></div>
			{tooltipTitle ? (
				<span className="tooltip-title">{tooltipTitle}</span>
			) : null}
			{/* This recognizes the \n characters in the description text and replaces them with a <br /> for html */}
			{typeof children === 'string'
				? children.split('\n').map((line, index, array) => (
						<>
							{line}
							{index < array.length - 1 && <br />}
						</>
				  ))
				: children}
		</div>
	);
};

export default Tooltip;
