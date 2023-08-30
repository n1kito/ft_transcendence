/* eslint-disable */
import Profile from './Profile';

export default {
	title: 'Profile',
};

const mockRef = { current: null }; // Mock ref object

export const Default = () => (
	<Profile
		login="testerlg"
		onCloseClick={() => null}
		windowDragConstraintRef={mockRef}
	/>
);

Default.story = {
	name: 'default',
};
