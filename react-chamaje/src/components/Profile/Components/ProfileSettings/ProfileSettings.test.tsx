import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProfileSettings from './ProfileSettings';

describe('<ProfileSettings />', () => {
	test('it should mount', () => {
		render(<ProfileSettings />);

		const profileSettings = screen.getByTestId('ProfileSettings');

		expect(profileSettings).toBeInTheDocument();
	});
});
