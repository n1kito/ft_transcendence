import React, { ReactNode, useEffect } from 'react';
import './SettingsWindow.css';

interface ISettingsWindowProps {
	windowTitle?: string;
	settingsWindowVisible: React.Dispatch<React.SetStateAction<boolean>>;
	children: ReactNode;
}

const SettingsWindow: React.FC<ISettingsWindowProps> = ({
	children,
	settingsWindowVisible,
	windowTitle = '',
}) => {
	useEffect(() => {
		console.log('Setting window CLICK');
	}, [settingsWindowVisible]);
	return (
		<div
			className="settings-window-wrapper"
			onClick={() => {
				// fetch/////
				settingsWindowVisible(false);
			}}
		>
			<div
				className="settings-window"
				onClick={(event) => event.stopPropagation()}
			>
				{windowTitle && windowTitle.length > 0 && (
					<div className="settings-window-titlebar">{windowTitle}</div>
				)}
				<div className="settings-window-content">{children}</div>
			</div>
		</div>
	);
};

export default SettingsWindow;
