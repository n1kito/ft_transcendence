import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Tooltip from './Tooltip';

describe('<Tooltip />', () => {
	test('it should mount', () => {
		render(<Tooltip>This is the content</Tooltip>);

		const tooltip = screen.getByTestId('Tooltip');

		expect(tooltip).toBeInTheDocument();
	});
});
