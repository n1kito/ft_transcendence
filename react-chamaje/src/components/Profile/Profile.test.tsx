import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Profile from './Profile';

describe('<Profile />', () => {
	test('it should mount', () => {
		const mockRef = { current: null }; // Mock ref object
		render(
			<Profile
				login="testerlg"
				onCloseClick={() => null}
				windowDragConstraintRef={mockRef}
			/>,
		);

		const profile = screen.getByTestId('Profile');

		expect(profile).toBeInTheDocument();
	});
});
