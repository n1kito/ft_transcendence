import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileMissions from './ProfileMissions';

describe('<ProfileMissions />', () => {
	test('it should mount', () => {
		render(<ProfileMissions />);

		const profileMissions = screen.getByTestId('ProfileMissions');

		expect(profileMissions).toBeInTheDocument();
	});
});
