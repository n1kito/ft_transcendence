/* eslint-disable */
import MatchHistoryBadge from './MatchHistoryBadge';

export default {
	title: 'MatchHistoryBadge',
};

export const Default = () => (
	<MatchHistoryBadge userScore={5} adversaryScore={7} badgeTitle="Title" />
);

Default.story = {
	name: 'default',
};
