/* eslint-disable */
import Button from './Button';

export default {
	title: 'Shared Components/Button',
};

export const Default = () => <Button>Default</Button>;

Default.story = {
	name: 'default',
};

export const PinkButton = () => <Button baseColor={[308, 80, 92]}>ok</Button>;
