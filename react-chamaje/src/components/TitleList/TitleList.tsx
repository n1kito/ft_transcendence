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
				<Title
					title="Titles"
					highlight={true}
					highlightColor="#FBD9F6"
					fontSize="1.25rem"
				/>
				<div className="titlesContainer">{props.children}</div>
			</div>
		</ShadowWrapper>
	);
};

export default TitleList;
