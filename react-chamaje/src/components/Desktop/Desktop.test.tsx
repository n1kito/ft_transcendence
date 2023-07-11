import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Desktop from './Desktop';

describe('<Desktop />', () => {
	test('it should mount', () => {
		render(<Desktop />);

		const desktop = screen.getByTestId('Desktop');

		expect(desktop).toBeInTheDocument();
	});
});
