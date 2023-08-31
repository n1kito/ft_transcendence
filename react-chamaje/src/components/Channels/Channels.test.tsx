import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Channels from './Channels';

describe('<Channels />', () => {
	test('it should mount', () => {
		render(<Channels />);

		const channels = screen.getByTestId('Channels');

		expect(channels).toBeInTheDocument();
	});
});
