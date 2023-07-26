import React, { ReactNode } from 'react';
import './ShadowWrapper.css';

export interface ShadowWrapperProps {
	children?: ReactNode;
	shadow?: boolean;
	clickable?: boolean;
	backgroundColor?: string;
}

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({
	children,
	shadow = false,
	clickable = false,
	backgroundColor = '',
}) => {
	return (
		<div
			className={`shadow-wrapper ${shadow ? 'shadow' : ''} ${
				clickable ? 'clickable' : ''
			}`}
			style={{ backgroundColor: backgroundColor }}
		>
			{children}
		</div>
	);
};

export default ShadowWrapper;
