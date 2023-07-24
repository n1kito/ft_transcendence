import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Title from './Title';

describe('<Title />', () => {
	test('it should mount', () => {
		render(<Title />);

		const title = screen.getByTestId('Title');

		expect(title).toBeInTheDocument();
	});
});
