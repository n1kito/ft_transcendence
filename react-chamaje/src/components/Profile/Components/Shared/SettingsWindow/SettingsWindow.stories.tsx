/* eslint-disable */
import SettingsWindow from './SettingsWindow';

export default {
	title: 'SettingsWindow',
};

const mockSetState = jest.fn();

export const Default = () => (
	<SettingsWindow settingsWindowVisible={mockSetState}>Settings</SettingsWindow>
);

Default.story = {
	name: 'default',
};
