import React, { ReactNode } from 'react';
import './TitleList.css';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import Title from '../Profile/Components/Title/Title';

export interface titleListProps {
	children?: ReactNode;
}

const TitleList: React.FC<titleListProps> = (props) => {
	return (
		<ShadowWrapper shadow={true}>
			<div className="titleBoxWrapper">
				<Title highlightColor="#FBD9F6">Titles</Title>
				<div className="titlesContainer">{props.children}</div>
			</div>
		</ShadowWrapper>
	);
};

export default TitleList;
