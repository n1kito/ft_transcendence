import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FriendsList from './FriendsList';

describe('<FriendsList />', () => {
	test('it should mount', () => {
		render(<FriendsList />);

		const friendsList = screen.getByTestId('FriendsList');

		expect(friendsList).toBeInTheDocument();
	});
});
