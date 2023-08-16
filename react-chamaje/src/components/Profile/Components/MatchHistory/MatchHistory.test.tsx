import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MatchHistory from './MatchHistory';

describe('<MatchHistory />', () => {
	test('it should mount', () => {
		render(<MatchHistory />);

		const matchHistory = screen.getByTestId('MatchHistory');

		expect(matchHistory).toBeInTheDocument();
	});
});
