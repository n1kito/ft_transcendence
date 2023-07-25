import React, { ReactNode } from 'react';
import './StatBadge.css';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';

export interface statBadgeProps {
	children?: ReactNode;
	title: string;
	isTextContent?: boolean;
}

const StatBadge: React.FC<statBadgeProps> = (props) => {
	return (
		<ShadowWrapper shadow={true}>
			<div className="statBadge">
				<div className="statBadgeTitle">{props.title}</div>
				<div
					className={`statBadgeContent ${
						props.isTextContent ? 'textContent' : ''
					}`}
				>
					<span>{props.children}</span>
				</div>
			</div>
		</ShadowWrapper>
	);
};

export default StatBadge;
