import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileStats from './ProfileStats';
import { UserData } from '../../../../contexts/UserContext';

describe('<ProfileStats />', () => {
	test('it should mount', () => {
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
		render(<ProfileStats profileData={testProfileData} />);

		const profileStats = screen.getByTestId('ProfileStats');

		expect(profileStats).toBeInTheDocument();
	});
});
