import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import OnlineIndicator from './OnlineIndicator';

describe('<OnlineIndicator />', () => {
	test('it should mount', () => {
		render(<OnlineIndicator />);

		const onlineIndicator = screen.getByTestId('OnlineIndicator');

		expect(onlineIndicator).toBeInTheDocument();
	});
});
