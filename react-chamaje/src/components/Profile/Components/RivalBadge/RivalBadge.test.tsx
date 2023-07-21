import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RivalBadge from './RivalBadge';

describe('<RivalBadge />', () => {
	test('it should mount', () => {
		render(<RivalBadge />);

		const rivalBadge = screen.getByTestId('RivalBadge');

		expect(rivalBadge).toBeInTheDocument();
	});
});
