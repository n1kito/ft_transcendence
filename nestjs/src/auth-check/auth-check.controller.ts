import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Req,
} from '@nestjs/common';
import { AuthCheckService } from './auth-check.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { TokenService } from 'src/token/token.service';

@Controller('auth-check')
export class AuthCheckController {
	constructor(private readonly authCheckService: AuthCheckService) {}
	// TODO: do we need a separate service here ? It's a simple check
	@Get()
	// This method checks if the user is authenticated by verifying the access token
	async checkAuth(
		@Req() req: Request,
	): Promise<{ isAuthentificated: boolean }> {
		try {
			// Get the access token from cookies in the request
			const accessToken = req.cookies['accessToken'];
			// Verify the access token and decode its content
			const decodedToken = jwt.verify(accessToken);
			// Determine if the user is authenticated based on the presence of a decoded token
			const isAuthentificated = !!decodedToken;
			// Return whether the user is authenticated
			return { isAuthentificated };
		} catch (error) {
			// Handle specific token verification errors and unauthorized cases
			if (
				error.name === 'JsonWebTokenError' ||
				error.name === 'TokenExpiredError'
			) {
				// If the token is invalid or expired, throw an Unauthorized exception
				throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
			}
			throw error;
		}
	}
}
