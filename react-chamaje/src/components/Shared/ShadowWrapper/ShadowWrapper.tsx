import React, { ReactNode } from 'react';
import './ShadowWrapper.css';

export interface ShadowWrapperProps {
	children?: ReactNode;
	shadow?: boolean;
	clickable?: boolean;
}

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({
	children,
	shadow = false,
	clickable = false,
}) => {
	return (
		<div
			className={`shadow-wrapper ${shadow ? 'shadow' : ''} ${
				clickable ? 'clickable' : ''
			}`}
		>
			{children}
		</div>
	);
};

export default ShadowWrapper;
