import React, { ReactNode } from 'react';
import './BlackBadge.css';

const BlackBadge: React.FC<{ children: ReactNode }> = ({ children }) => {
	return <div className="black-badge">{children}</div>;
};

export default BlackBadge;
