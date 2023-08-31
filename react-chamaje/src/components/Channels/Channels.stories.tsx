/* eslint-disable */
import { createRef } from 'react';
import Channels from './Channels';

export default {
	title: 'Channels',
};

const mockRef = createRef<HTMLDivElement>();

export const Default = () => (
	<Channels onCloseClick={() => null} windowDragConstraintRef={mockRef} />
);

Default.story = {
	name: 'default',
};
