import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsWindow from './SettingsWindow';

describe('<SettingsWindow />', () => {
	test('it should mount', () => {
		const mockSetState = jest.fn();
		render(
			<SettingsWindow settingsWindowVisible={mockSetState}>
				Settings content
			</SettingsWindow>,
		);

		const settingsWindow = screen.getByTestId('SettingsWindow');

		expect(settingsWindow).toBeInTheDocument();
	});
});
