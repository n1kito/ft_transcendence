import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Window from './Window';

describe('<Window />', () => {
	test('it should mount', () => {
		render(<Window />);

		const window = screen.getByTestId('Window');

		expect(window).toBeInTheDocument();
	});
});
