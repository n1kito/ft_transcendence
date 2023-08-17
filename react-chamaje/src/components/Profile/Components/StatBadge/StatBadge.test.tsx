import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StatBadge from './StatBadge';

describe('<StatBadge />', () => {
	test('it should mount', () => {
		render(<StatBadge title="Default title" />);

		const statBadge = screen.getByTestId('StatBadge');

		expect(statBadge).toBeInTheDocument();
	});
});
