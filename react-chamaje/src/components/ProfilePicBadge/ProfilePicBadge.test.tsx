import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfilePicBadge from './ProfilePicBadge';
import m3ganPic from '../Friends/Components/FriendBadge/images/m3gan.jpg';
describe('<ProfilePicBadge />', () => {
	test('it should mount', () => {
		render(<ProfilePicBadge picture={m3ganPic} />);

		const profilePicBadge = screen.getByTestId('ProfilePicBadge');

		expect(profilePicBadge).toBeInTheDocument();
	});
});
