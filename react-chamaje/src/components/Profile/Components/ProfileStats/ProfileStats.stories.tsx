/* eslint-disable */
import ProfileStats from './ProfileStats';

export default {
	title: 'ProfileStats',
};

const testProfileData = {
	image: 'default-image.png',
	login: 'default-login',
	email: 'default-email@example.com',
	killCount: 0,
	winRate: 0,
	gamesCount: 0,
	bestFriendLogin: '',
	rank: 0,
	targetLogin: '',
	targetImage: '',
	targetHasBeenAssigned: false,
	// other default values...
};

export const Default = () => <ProfileStats profileData={testProfileData} />;

Default.story = {
	name: 'default',
};
