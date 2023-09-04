import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import WindowCloseSquare from './WindowCloseSquare';

describe('<WindowCloseSquare />', () => {
	test('it should mount', () => {
		render(<WindowCloseSquare onCloseClick={() => null} />);

		const windowCloseSquare = screen.getByTestId('WindowCloseSquare');

		expect(windowCloseSquare).toBeInTheDocument();
	});
});
