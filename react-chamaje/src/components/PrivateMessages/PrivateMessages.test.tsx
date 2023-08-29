import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PrivateMessages from './PrivateMessages';

describe('<PrivateMessages />', () => {
	test('it should mount', () => {
		const mockRef = { current: null }; // Mock ref object
		render(<PrivateMessages onCloseClick={() => null} windowDragConstraintRef={mockRef}/>);

		const privateMessages = screen.getByTestId('PrivateMessages');

		expect(privateMessages).toBeInTheDocument();
	});
});
