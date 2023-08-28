/* eslint-disable */
import ProfileMissions from './ProfileMissions';

export default {
	title: 'ProfileMissions',
};

export const Default = () => (
	<ProfileMissions
		profileLogin="login"
		targetLogin="tlogin"
		targetDiscoveredByUser={false}
	/>
);

Default.story = {
	name: 'default',
};
