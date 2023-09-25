import { GameEntity } from './Shared';
import Paddle from './Paddle';
import { IBallState } from '../../../../../../../shared-lib/types/game';

export default class Ball extends GameEntity {
	constructor(x: number, y: number, width: number, height: number) {
		super(x, y, width, height);
	}

	// Updates the ball props except for its position
	update(newState: IBallState, scoreChanged: boolean) {
		// If the score changed, we want the ball to snap to the middle
		// with no interpolation
		if (scoreChanged || Math.abs(this.x - newState.x) > 20) {
			this.x = this.targetX = newState.x;
			this.y = this.targetY = newState.y;
		} else {
			this.targetX = newState.x;
			this.targetY = newState.y;
		}
		this.width = newState.width;
		this.height = newState.height;
	}
}
