import React, { ReactNode } from 'react';
import './TitleList.css';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import Title from '../Profile/Components/Title/Title';

export interface titleListProps {
	children?: ReactNode;
}

const TitleList: React.FC<titleListProps> = (props) => {
	return (
		<div className="title-list-wrapper">
			<ShadowWrapper shadow={true}>
				<div className="title-box-wrapper">
					<Title highlightColor="#FBD9F6">Titles</Title>
					<div className="titles-container">{props.children}</div>
				</div>
			</ShadowWrapper>
		</div>
	);
};

export default TitleList;
