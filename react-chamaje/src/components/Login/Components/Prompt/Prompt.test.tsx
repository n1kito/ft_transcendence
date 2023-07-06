import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Prompt from './Prompt';

describe('<Prompt />', () => {
	test('it should mount', () => {
		render(<Prompt />);

		const prompt = screen.getByTestId('Prompt');

		expect(prompt).toBeInTheDocument();
	});
});
