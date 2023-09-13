import { Controller, Get, HttpStatus, Param, Req, Res } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { CustomRequest } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { GameRoomStatus } from '@prisma/client';
import { GameService } from './game.service';
import AuthService from 'src/auth/auth.service';

@Controller('game')
export class GameController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly prisma: PrismaService,
		private readonly tokenService: TokenService,
		private readonly gameService: GameService,
	) {}

	// So that would be a fetch request, and then in the back the room is either
	// found or created, and the back sets the room up and replies with its ID,
	// and then the front knows the "channel/topic" to connect to via websockets

	// @Get('assign-room/:userId?')
	// async assignRoom(
	// 	@Req() request: CustomRequest,
	// 	@Res() response: Response,
	// 	@Param('userId') adversaryId?: number,
	// ) {
	// 	console.log('👀 user is looking for a room to play in !');
	// 	// Authentificate user
	// 	try {
	// 		// Check that the request is coming from an authorized user
	// 		const userId = this.tokenService.ExtractUserId(
	// 			request.headers['authorization'],
	// 		);
	// 		// Check that the user requesting is still in the db
	// 		if (!this.authService.checkUserExists(userId))
	// 			throw new Error('Could not find requesting user in the database');
	// 		// If there is an adversary, also check that they exist
	// 		if (adversaryId && !this.authService.checkUserExists(adversaryId))
	// 			throw new Error('Could not find adversary user in the database');

	// 		// // Now let's locate a room to return, depending on whether we have an adversary or not
	// 		// let assignedRoom;
	// 		// if (adversaryId)
	// 		// 	assignedRoom = await this.gameService.handleAdversaryRoomAssignment(
	// 		// 		userId,
	// 		// 		adversaryId,
	// 		// 	);
	// 		// else
	// 		// 	assignedRoom = await this.gameService.handleSoloRoomAssignment(userId);

	// 		// Return the room
	// 		return response.status(HttpStatus.OK).json({ roomId: assignedRoom.id });
	// 	} catch (error) {
	// 		// I read it was better to log full errors to the console but send
	// 		// a generic message back to the end user, for security reasons.
	// 		console.error(
	// 			`[Error when trying to assign a game room to a user]\n${error}`,
	// 		);
	// 		return response
	// 			.status(HttpStatus.UNAUTHORIZED)
	// 			.json({ message: 'Could not assign room to user' });
	// 	}
	// }
}
