import React from 'react';
import './Lock.css';
import locked from '../../images/lock.svg';

const Lock = () => {
	return (
		<div id="lockWrapper">
			<img src={locked} />
		</div>
	);
};

export default Lock;
