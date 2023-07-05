/* eslint-disable */
import Window from './Window';
import { WindowProps } from './Window';

export default {
	title: 'Components/Window',
};

export const Default = (args: WindowProps) => <Window {...args} />;

Default.args = {
	windowTitle: 'Default',
};

// Default.story = {
// 	name: 'default',
// 	parameters: {
// 		controls: { hideNoControlsWarning: true },
// 	},
// 	argTypes: {
// 		windowTitle: {
// 			control: 'text',
// 		},
// 	},
// };
