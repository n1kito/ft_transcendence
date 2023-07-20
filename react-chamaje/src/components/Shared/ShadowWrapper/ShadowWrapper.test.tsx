import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ShadowWrapper from './ShadowWrapper';

describe('<ShadowWrapper />', () => {
	test('it should mount', () => {
		render(<ShadowWrapper />);

		const shadowWrapper = screen.getByTestId('ShadowWrapper');

		expect(shadowWrapper).toBeInTheDocument();
	});
});
