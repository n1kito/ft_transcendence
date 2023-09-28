import React, { ReactNode, useEffect, useState } from 'react';
import './ShadowWrapper.css';

export interface ShadowWrapperProps {
	children?: ReactNode;
	shadow?: boolean;
	isClickable?: boolean;
	backgroundColor?: string;
	dashedBorder?: boolean;
	shaking?: boolean;
	onClick?: () => void;
}

const ShadowWrapper: React.FC<ShadowWrapperProps> = ({
	children,
	isClickable = false,
	shadow = isClickable,
	backgroundColor = '',
	dashedBorder = false,
	shaking = false,
	onClick,
}) => {
	const [isShaking, setIsShaking] = useState(false);

	useEffect(() => {
		if (shaking) {
			const shakeInterval = setInterval(() => {
				setIsShaking(true);
				const shakeDuration = 1000; // Shake for 1 seconds
				setTimeout(() => {
					setIsShaking(false);
				}, shakeDuration);
			}, 5000); // Start shaking every 10 seconds

			// Clean up interval on unmount or when hasStartedRoulette changes to true
			return () => clearInterval(shakeInterval);
		}
	}, [shaking]);

	return (
		<div
			className={`shadow-wrapper ${shadow ? 'shadow' : ''} ${
				isClickable ? 'clickable' : ''
			} ${dashedBorder ? 'dashed-border' : ''}
			${isShaking ? 'shake' : ''}`}
			style={{ backgroundColor: backgroundColor }}
			onClick={isClickable ? onClick : undefined}
		>
			{children}
		</div>
	);
};

export default ShadowWrapper;
