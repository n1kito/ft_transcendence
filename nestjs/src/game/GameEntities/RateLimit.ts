import { Server, Socket } from 'socket.io';

// Constants
const WINDOW_MS = 1000; // 10 seconds
const LIMIT = 120;

// floods object
interface FloodsObject {
	[key: string]: { count: number };
}

// Flood protection object
const flood = {
	rateLimit: {} as FloodsObject,
	lastLimitRateClear: Date.now(),

	protect: (io: Server, socket: Socket) => {
		// Reset flood protection
		if (Math.abs(Date.now() - flood.lastLimitRateClear) > WINDOW_MS) {
			flood.rateLimit = {};
			flood.lastLimitRateClear = Date.now();
		}

		flood.rateLimit[socket.id] = flood.rateLimit[socket.id] || { count: 0 };
		flood.rateLimit[socket.id].count++;
		// throw error if they exceed LIMIT in WINDOW_MS
		if (flood.rateLimit[socket.id].count > LIMIT) {
			throw Error('Rate Limit exceeded');
		}
		return;
	},
};

export default flood;
