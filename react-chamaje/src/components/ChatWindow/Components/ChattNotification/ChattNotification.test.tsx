import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChattNotification from './ChattNotification';

describe('<ChattNotification />', () => {
	test('it should mount', () => {
		render(<ChattNotification recipient="" sender="" type="" />);

		const chattNotification = screen.getByTestId('ChattNotification');

		expect(chattNotification).toBeInTheDocument();
	});
});
