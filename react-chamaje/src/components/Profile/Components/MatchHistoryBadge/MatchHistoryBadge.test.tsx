import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MatchHistoryBadge from './MatchHistoryBadge';

describe('<MatchHistoryBadge />', () => {
	test('it should mount', () => {
		render(
			<MatchHistoryBadge userScore={5} adversaryScore={6} badgeTitle="Title" />,
		);

		const matchHistoryBadge = screen.getByTestId('MatchHistoryBadge');

		expect(matchHistoryBadge).toBeInTheDocument();
	});
});
