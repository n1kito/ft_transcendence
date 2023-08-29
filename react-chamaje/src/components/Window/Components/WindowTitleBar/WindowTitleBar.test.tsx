import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WindowTitleBar from './WindowTitleBar';

describe('<WindowTitleBar />', () => {
	test('it should mount', () => {
		render(<WindowTitleBar onCloseClick={() => null}/>);

		const windowTitleBar = screen.getByTestId('WindowTitleBar');

		expect(windowTitleBar).toBeInTheDocument();
	});
});
