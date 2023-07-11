import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DesktopIcon from './DesktopIcon';

describe('<DesktopIcon />', () => {
	test('it should mount', () => {
		render(<DesktopIcon name="Test" iconSrc="" />);

		const desktopIcon = screen.getByTestId('DesktopIcon');

		expect(desktopIcon).toBeInTheDocument();
	});
});
