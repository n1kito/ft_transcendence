import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ChatBubble from './ChatBubble';

describe('<ChatBubble />', () => {
	test('it should mount', () => {
		render(<ChatBubble>Message content</ChatBubble>);

		const chatBubble = screen.getByTestId('ChatBubble');

		expect(chatBubble).toBeInTheDocument();
	});
});
