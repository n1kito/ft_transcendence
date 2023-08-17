import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import RetrieveAccessToken from './RetrieveAccessToken';

describe('<RetrieveAccessToken />', () => {
	test('it should mount', () => {
		render(<RetrieveAccessToken />);

		const retrieveAccessToken = screen.getByTestId('RetrieveAccessToken');

		expect(retrieveAccessToken).toBeInTheDocument();
	});
});
