import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import LeaderboardCard from './LeaderboardCard';

describe('<LeaderboardCard />', () => {
	test('it should mount', () => {
		// render(<LeaderboardCard />);

		const leaderboardCard = screen.getByTestId('LeaderboardCard');

		expect(leaderboardCard).toBeInTheDocument();
	});
});
