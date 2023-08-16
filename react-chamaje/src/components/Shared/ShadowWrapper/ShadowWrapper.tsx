import React, { ReactNode } from 'react';
import './ShadowWrapper.css';

export interface ShadowWrapperProps {
	children?: ReactNode;
	shadow?: boolean;
	isClickable?: boolean;
	backgroundColor?: string;
	onClick?: () => void;
}

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({
	children,
	isClickable = false,
	shadow = isClickable,
	backgroundColor = '',
	onClick,
}) => {
	return (
		<div
			className={`shadow-wrapper ${shadow ? 'shadow' : ''} ${
				isClickable ? 'clickable' : ''
			}`}
			style={{ backgroundColor: backgroundColor }}
			onClick={isClickable ? onClick : undefined}
		>
			{children}
		</div>
	);
};

export default ShadowWrapper;
