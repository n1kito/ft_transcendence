import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import TitleList from './TitleList';

describe('<TitleList />', () => {
	test('it should mount', () => {
		render(<TitleList />);

		const titleList = screen.getByTestId('TitleList');

		expect(titleList).toBeInTheDocument();
	});
});
