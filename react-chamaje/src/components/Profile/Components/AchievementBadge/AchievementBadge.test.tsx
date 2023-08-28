import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AchievementBadge from './AchievementBadge';

describe('<AchievementBadge />', () => {
	test('it should mount', () => {
		render(<AchievementBadge name='Title' description='Some description' icon=''/>);

		const achievementBadge = screen.getByTestId('AchievementBadge');

		expect(achievementBadge).toBeInTheDocument();
	});
});
