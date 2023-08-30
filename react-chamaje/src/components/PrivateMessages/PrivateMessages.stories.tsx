/* eslint-disable */
import PrivateMessages from './PrivateMessages';

export default {
	title: 'PrivateMessages',
};

const mockRef = { current: null }; // Mock ref object

export const Default = () => (
	<PrivateMessages
		onCloseClick={() => null}
		windowDragConstraintRef={mockRef}
	/>
);

Default.story = {
	name: 'default',
};
