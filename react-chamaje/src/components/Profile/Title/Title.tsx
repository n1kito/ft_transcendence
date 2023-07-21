import React from 'react';
import './Title.css';

interface TitleProps {
	title?: string;
	highlight?: boolean;
	highlightColor?: string;
	fontSize?: string;
}

const Title: React.FC<TitleProps> = ({
	title = '',
	highlight = false,
	highlightColor = '',
	fontSize = '2rem',
}) => {
	return (
		<div className="title" style={{ fontSize: fontSize }}>
			<span>{title}</span>
			{highlight && (
				<div
					className="highlight"
					style={{ backgroundColor: highlightColor }}
				></div>
			)}
		</div>
	);
};

export default Title;
