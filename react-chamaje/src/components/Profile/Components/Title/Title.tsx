import React from 'react';
import './Title.css';

interface TitleProps {
	title?: string;
	bigTitle?: boolean;
	highlight?: boolean;
	highlightColor?: string;
	fontSize?: string;
	toolTip?: string;
	children: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({
	title = '',
	bigTitle = false,
	highlight = bigTitle ? false : true,
	highlightColor = highlight ? '#FBD9F6' : '',
	fontSize = bigTitle ? '2.5rem' : '1.5rem',
	toolTip = '',
	children,
}) => {
	return (
		<div
			className="titleWrapper"
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
			{toolTip ? <div className="tooltip">(?)</div> : null}
		</div>
	);
};

export default Title;
