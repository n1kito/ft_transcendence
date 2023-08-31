import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Channels from './Channels';

describe('<Channels />', () => {
	test('it should mount', () => {
		const mockRef = createRef<HTMLDivElement>();
		render(
			<Channels onCloseClick={() => null} windowDragConstraintRef={mockRef} />,
		);

		const channels = screen.getByTestId('Channels');

		expect(channels).toBeInTheDocument();
	});
});
