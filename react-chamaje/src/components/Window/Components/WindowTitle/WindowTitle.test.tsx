import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WindowTitle from './WindowTitle';

describe('<WindowTitle />', () => {
	test('it should mount', () => {
		render(<WindowTitle />);

		const windowTitle = screen.getByTestId('WindowTitle');

		expect(windowTitle).toBeInTheDocument();
	});
});
