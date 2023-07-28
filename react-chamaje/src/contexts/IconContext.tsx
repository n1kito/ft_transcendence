import React, { createContext, useContext, useState } from 'react';

interface IIconContextProps {
	selectedIcon: number;
	setSelectedIcon: React.Dispatch<React.SetStateAction<number>>;
}

export const IconContext = createContext<IIconContextProps | undefined>({
	selectedIcon: -1,
	setSelectedIcon: () => {
		/* no-op */
		// Using a no-operation function as the default value
	},
});

interface IIconProviderProps {
	children: React.ReactNode;
}

const IconContextProvider: React.FC<IIconProviderProps> = ({
	children,
}: IIconProviderProps) => {
	// Create a state to be able to track the currently selected desktop icon
	const [selectedIcon, setSelectedIcon] = useState(-1);

	const contextValue: IIconContextProps = {
		selectedIcon,
		setSelectedIcon,
	};
	return (
		<IconContext.Provider value={contextValue}>{children}</IconContext.Provider>
	);
};

export const useIconContext = (): IIconContextProps => {
	const context = useContext(IconContext);
	if (!context) {
		throw new Error(
			'useIconContext must be used within an IconContextProvider',
		);
	}
	return context;
};

export default IconContextProvider;
