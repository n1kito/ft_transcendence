import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LoginForm from './LoginForm';

describe('<LoginForm />', () => {
	test('it should mount', () => {
		render(<LoginForm />);

		const loginForm = screen.getByTestId('LoginForm');

		expect(loginForm).toBeInTheDocument();
	});
});
