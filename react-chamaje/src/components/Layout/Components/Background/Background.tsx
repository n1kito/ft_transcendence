import React from 'react';
import './Background.css';

const Background = () => {
	return (
		<div id="bgWrapper">
			<div id="blur"></div>
			<div className="background-dot dot-1"></div>
			<div className="background-dot dot-2"></div>
			<div className="background-dot dot-3"></div>
		</div>
	);
};

export default Background;
