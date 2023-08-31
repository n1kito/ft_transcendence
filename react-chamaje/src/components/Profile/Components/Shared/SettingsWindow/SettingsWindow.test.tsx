import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsWindow from './SettingsWindow';

describe('<SettingsWindow />', () => {
	test('it should mount', () => {
		render(<SettingsWindow />);

		const settingsWindow = screen.getByTestId('SettingsWindow');

		expect(settingsWindow).toBeInTheDocument();
	});
});
