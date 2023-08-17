import {
	Controller,
	Get,
	Headers,
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
		@Headers('Authorization') authorization: string,
	): Promise<{ isAuthentificated: boolean }> {
		try {
			// Check that an authorization header was included
			if (!authorization) {
				throw new HttpException(
					'No authorization header',
					HttpStatus.UNAUTHORIZED,
				);
			}
			// Split the Authorization header value
			const split = authorization.split(' ');
			// Check that the Authorization format is correct
			if (split.length !== 2 || split[0] !== 'Bearer') {
				throw new HttpException(
					'Invalid authorization format',
					HttpStatus.BAD_REQUEST,
				);
			}
			// Extract the token
			const accessToken = split[1];
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
				error.name === 'TokenExpiredError' ||
				error instanceof HttpException // Catch our custom exceptions
			) {
				console.log('There was an error with auth-check: ' + error);
				// If the token is invalid or expired, throw an Unauthorized exception
				throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
			}
			throw error;
		}
	}
}
