import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BlackBadge from './BlackBadge';

describe('<BlackBadge />', () => {
	test('it should mount', () => {
		render(<BlackBadge>Test</BlackBadge>);

		const blackBadge = screen.getByTestId('BlackBadge');

		expect(blackBadge).toBeInTheDocument();
	});
});
