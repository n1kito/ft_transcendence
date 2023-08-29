import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PrivateMessagesList from './PrivateMessagesList';

describe('<PrivateMessagesList />', () => {
	test('it should mount', () => {
		render(<PrivateMessagesList />);

		const privateMessagesList = screen.getByTestId('PrivateMessagesList');

		expect(privateMessagesList).toBeInTheDocument();
	});
});
