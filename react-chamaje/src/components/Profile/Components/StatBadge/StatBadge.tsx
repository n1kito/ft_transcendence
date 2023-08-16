import React, { ReactNode } from 'react';
import './StatBadge.css';
import ShadowWrapper from '../../../Shared/ShadowWrapper/ShadowWrapper';

export interface IstatBadgeProps {
	children?: ReactNode;
	isClickable?: boolean;
	title: string;
	isTextContent?: boolean;
	onClick?: () => void;
}

const StatBadge: React.FC<IstatBadgeProps> = ({
	children,
	isClickable = false,
	title,
	isTextContent = false,
	onClick,
}) => {
	return (
		<ShadowWrapper
			isClickable={isClickable}
			onClick={isClickable ? onClick : undefined}
		>
			<div className="statBadge">
				<div className="statBadgeTitle">{title}</div>
				<div
					className={`statBadgeContent ${isTextContent ? 'textContent' : ''}`}
				>
					<span>{children}</span>
				</div>
			</div>
		</ShadowWrapper>
	);
};

export default StatBadge;
