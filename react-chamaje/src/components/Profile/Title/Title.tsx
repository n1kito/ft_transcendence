import React from 'react';
import './Title.css';

interface TitleProps {
	title?: string;
	highlight?: boolean;
	highlightColor?: string;
	fontSize?: string;
	toolTip?: string;
}

const Title: React.FC<TitleProps> = ({
	title = '',
	highlight = false,
	highlightColor = '',
	fontSize = '2rem',
	toolTip = '',
}) => {
	return (
		<div
			className="titleWrapper"
			style={{ fontSize: fontSize }}
			title={toolTip}
		>
			<div className="title">
				<span>{title}</span>
				{highlight && (
					<div
						className="highlight"
						style={{ backgroundColor: highlightColor }}
					></div>
				)}
			</div>
			{toolTip ? <div className="tooltip">(?)</div> : null}
		</div>
	);
};

export default Title;
