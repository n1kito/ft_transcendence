import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Clock from './Clock';

describe('<Clock />', () => {
	test('it should mount', () => {
		render(<Clock />);

		const clock = screen.getByTestId('Clock');

		expect(clock).toBeInTheDocument();
	});
});
