import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Background from './Background';

describe('<Background />', () => {
	test('it should mount', () => {
		render(<Background />);

		const background = screen.getByTestId('Background');

		expect(background).toBeInTheDocument();
	});
});
