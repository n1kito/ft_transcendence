import React, { createContext, useContext, useState } from 'react';

interface WindowContextType {
	maxZIndex: number;
	updateMaxZIndex: () => void;
}

export const WindowContext = createContext<WindowContextType>({
	maxZIndex: 0,
	updateMaxZIndex: () => {
		throw new Error('updateMaxZIndex function must be overriden');
	},
});

export const WindowProvider = ({ children }: { children: React.ReactNode }) => {
	const [maxZIndex, setMaxZIndex] = useState(2);

	const updateMaxZIndex = () => {
		setMaxZIndex((prevMaxZIndex) => prevMaxZIndex + 1);
	};

	return (
		<WindowContext.Provider value={{ maxZIndex, updateMaxZIndex }}>
			{children}
		</WindowContext.Provider>
	);
};

export const useWindowContext = () => {
	const context = useContext(WindowContext);
	if (!context) {
		throw new Error('useZIndex must be used within a ZIndexProvider');
	}
	return context;
};
