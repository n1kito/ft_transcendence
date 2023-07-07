import React, { useEffect, useState } from 'react';
import './Clock.css';

const Clock = () => {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	return <div>{currentTime.toLocaleTimeString().replace(/(.*)\D\d+/, '$1')}</div>;
};

export default Clock;
