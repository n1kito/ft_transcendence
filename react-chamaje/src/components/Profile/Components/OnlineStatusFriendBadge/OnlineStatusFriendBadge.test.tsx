import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OnlineStatusFriendBadge from './OnlineStatusFriendBadge';

describe('<OnlineStatusFriendBadge />', () => {
	test('it should mount', () => {
		render(<OnlineStatusFriendBadge />);

		const onlineStatusFriendBadge = screen.getByTestId(
			'OnlineStatusFriendBadge',
		);

		expect(onlineStatusFriendBadge).toBeInTheDocument();
	});
});
