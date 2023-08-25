import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TargetBadge from './TargetBadge';

describe('<TargetBadge />', () => {
	test('it should mount', () => {
		render(<TargetBadge isOwnProfile={false} targetLogin="login" />);

		const targetBadge = screen.getByTestId('TargetBadge');

		expect(targetBadge).toBeInTheDocument();
	});
});
