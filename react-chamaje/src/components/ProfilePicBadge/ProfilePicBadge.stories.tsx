/* eslint-disable */
import ProfilePicBadge from './ProfilePicBadge';
import m3ganPic from '../Friends/Components/FriendBadge/images/m3gan.jpg';

export default {
	title: 'ProfilePicBadge',
};

export const Default = () => <ProfilePicBadge picture={m3ganPic} />;

Default.story = {
	name: 'default',
};
