import React from 'react';
import './Title.css';

interface TitleProps {
	title?: string;
	highlight?: boolean;
	highlightColor?: string;
}

const Title: React.FC<TitleProps> = ({
	title = '',
	highlight = false,
	highlightColor = '',
}) => {
	return (
		<div className="title">
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
