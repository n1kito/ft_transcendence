import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Lock from './Lock';

describe('<Lock />', () => {
	test('it should mount', () => {
		render(<Lock />);

		const lock = screen.getByTestId('Lock');

		expect(lock).toBeInTheDocument();
	});
});
