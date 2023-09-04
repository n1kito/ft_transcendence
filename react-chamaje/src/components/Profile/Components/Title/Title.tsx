import React, { useState } from 'react';
import './Title.css';
import Tooltip from '../../../Shared/Tooltip/Tooltip';

interface TitleProps {
	bigTitle?: boolean;
	highlight?: boolean;
	highlightColor?: string;
	fontSize?: string;
	toolTip?: string;
	children: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({
	bigTitle = false,
	highlight = bigTitle ? false : true,
	highlightColor = highlight ? '#FBD9F6' : '',
	fontSize = bigTitle ? '2.5rem' : '1.5rem',
	toolTip = '',
	children,
}) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className="title-wrapper"
			style={{ fontSize: fontSize }}
			title={toolTip}
		>
			<div className="title">
				<span>{children}</span>
				{highlight && (
					<div
						className="highlight"
						style={{ backgroundColor: highlightColor }}
					></div>
				)}
			</div>
			{toolTip ? (
				<div
					className="tooltip-trigger"
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
				>
					(?)
					<Tooltip position="bottom" isVisible={isHovered}>
						{toolTip}
					</Tooltip>
				</div>
			) : null}
		</div>
	);
};

export default Title;
