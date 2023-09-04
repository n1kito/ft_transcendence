/* eslint-disable */
import MatchHistoryBadge from './MatchHistoryBadge';

export default {
	title: 'MatchHistoryBadge',
};

export const Default = () => (
	<MatchHistoryBadge userScore={5} adversaryScore={7} adversaryLogin="Login" />
);

Default.story = {
	name: 'default',
};
