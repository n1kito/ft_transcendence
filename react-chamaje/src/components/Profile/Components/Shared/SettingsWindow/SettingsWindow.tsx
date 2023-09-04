import React, { ReactNode } from 'react';
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
	return (
		<div
			className="settings-window-wrapper"
			onClick={() => {
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
