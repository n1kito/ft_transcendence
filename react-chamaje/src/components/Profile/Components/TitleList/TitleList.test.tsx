import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TitleList from './TitleList';

describe('<TitleList />', () => {
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
			targetDiscoveredByUser: false,
			// other default values...
		};
		render(<TitleList profileData={testProfileData}/>);

		const titleList = screen.getByTestId('TitleList');

		expect(titleList).toBeInTheDocument();
	});
});
