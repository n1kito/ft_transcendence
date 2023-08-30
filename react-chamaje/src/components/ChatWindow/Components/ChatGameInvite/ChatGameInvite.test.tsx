import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChatGameInvite from './ChatGameInvite';

describe('<ChatGameInvite />', () => {
	test('it should mount', () => {
		render(<ChatGameInvite />);

		const chatGameInvite = screen.getByTestId('ChatGameInvite');

		expect(chatGameInvite).toBeInTheDocument();
	});
});
