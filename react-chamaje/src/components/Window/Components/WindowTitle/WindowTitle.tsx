import React from 'react';
import './WindowTitle.css';

interface WindowTitleProps {
	windowTitle?: string;
}

const WindowTitle: React.FC<WindowTitleProps> = ({ windowTitle }) => {
	return <span>{windowTitle}</span>;
};

export default WindowTitle;
