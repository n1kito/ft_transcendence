/* eslint-disable */
import { storiesOf } from '@storybook/react';
import DesktopIcon from './DesktopIcon';
import { IconProps } from './DesktopIcon';

export default {
	title: 'Components/Desktop/DesktopIcon',
	iconSrc: '',
};

export const Default = (args: IconProps) => <DesktopIcon {...args} />;

Default.story = {
	name: 'default',
};

Default.args = {
	name: 'Title',
};
