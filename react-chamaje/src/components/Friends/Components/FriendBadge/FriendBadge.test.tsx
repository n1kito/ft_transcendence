import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FriendBadge from './FriendBadge';

describe('<FriendBadge />', () => {
	test('it should mount', () => {
		render(<FriendBadge badgeTitle="Title" />);

		const friendBadge = screen.getByTestId('FriendBadge');

		expect(friendBadge).toBeInTheDocument();
	});
});
