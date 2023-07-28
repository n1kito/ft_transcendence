import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FullscreenTrigger from './FullscreenTrigger';

describe('<FullscreenTrigger />', () => {
	test('it should mount', () => {
		render(<FullscreenTrigger />);

		const fullscreenTrigger = screen.getByTestId('FullscreenTrigger');

		expect(fullscreenTrigger).toBeInTheDocument();
	});
});
