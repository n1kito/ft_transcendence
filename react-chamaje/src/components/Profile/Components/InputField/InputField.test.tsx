import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import InputField from './InputField';

describe('<InputField />', () => {
	test('it should mount', () => {
		render(<InputField />);

		const inputField = screen.getByTestId('InputField');

		expect(inputField).toBeInTheDocument();
	});
});
