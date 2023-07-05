import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WindowMenu from './WindowMenu';

describe('<WindowMenu />', () => {
	test('it should mount', () => {
		render(<WindowMenu />);

		const windowMenu = screen.getByTestId('WindowMenu');

		expect(windowMenu).toBeInTheDocument();
	});
});
