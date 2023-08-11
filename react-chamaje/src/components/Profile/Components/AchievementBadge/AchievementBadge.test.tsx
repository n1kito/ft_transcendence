import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AchievementBadge from './AchievementBadge';

describe('<AchievementBadge />', () => {
	test('it should mount', () => {
		render(<AchievementBadge achievementTitle='neverDied'/>);

		const achievementBadge = screen.getByTestId('AchievementBadge');

		expect(achievementBadge).toBeInTheDocument();
	});
});
