import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Leaderboard from './Leaderboard';

describe('<Leaderboard />', () => {
	test('it should mount', () => {
		// render(<Leaderboard />);

		const leaderboard = screen.getByTestId('Leaderboard');

		expect(leaderboard).toBeInTheDocument();
	});
});
