import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileStats from './ProfileStats';

describe('<ProfileStats />', () => {
	test('it should mount', () => {
		render(<ProfileStats />);

		const profileStats = screen.getByTestId('ProfileStats');

		expect(profileStats).toBeInTheDocument();
	});
});
