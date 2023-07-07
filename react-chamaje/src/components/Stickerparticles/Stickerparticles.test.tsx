import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Stickerparticles from './Stickerparticles';

describe('<Stickerparticles />', () => {
	test('it should mount', () => {
		render(<Stickerparticles />);

		const stickerparticles = screen.getByTestId('Stickerparticles');

		expect(stickerparticles).toBeInTheDocument();
	});
});
