import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Terminal from './Terminal';

describe('<Terminal />', () => {
	test('it should mount', () => {
		render(<Terminal />);

		const terminal = screen.getByTestId('Terminal');

		expect(terminal).toBeInTheDocument();
	});
});
