import {
	Headers,
	HttpException,
	HttpStatus,
	Injectable,
	NestMiddleware,
	Redirect,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { TokenService } from 'src/token/token.service';

// We use @Injectable decorator provided by NestJS here to mark this class as a provider that can be managed by the NestJS's dependency injection system.
@Injectable()
export class AuthMiddleWare implements NestMiddleware {
	constructor(
		private readonly prisma: PrismaService,
		private readonly tokenService: TokenService,
	) {}
	// The use method is what we implement as part of the NestMiddleware interface. It gets executed when a middleware function is invoked.
	// This method has three parameters: req (which represents the request object), res (which represents the response object), and next (which is a callback to invoke the next middleware function).
	async use(req: any, res: Response, next: NextFunction) {
		console.log('🚨 auth middleware police 🚨');

		const routePath = req.originalUrl;
		console.log('🚨 Finale Destination:', routePath);

		if (
			routePath &&
			(routePath === '/auth-check' ||
				routePath === '/token/refresh-token' ||
				routePath.startsWith('/login'))
		) {
			console.log(
				'🚔going to authentication jwt token gate, skipping middleware',
			);
			// Skip middleware for excluded routes
			next();
			return;
		}
		// Here, we extract the JWT from the cookies sent with the request.
		const authorization = req.headers['authorization'];
		const refreshToken = req.cookies['refreshToken'];
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
			// Now, we verify the JWT using the secret key.
			// If the token is valid, jwt.verify returns the payload of the token (the data that was initially stored in the token when it was signed).
			// If the token is not valid (maybe it was tampered with, or it's expired), jwt.verify throws an error.

			const decodedAccessToken = this.tokenService.verifyToken(accessToken);
			const decodedRefreshToken = this.tokenService.verifyToken(refreshToken);

			// Check that the user is indeed part of our database (maybe they are using an old cookie, should not happen but does not hurt to check)
			const userPromise = this.prisma.user.findUnique({
				where: { id: decodedAccessToken.userId },
			});

			userPromise
				.then((user) => {
					if (!user) throw new Error('Request coming from unknown user');
					// If the token is verified, we attach the payload of the JWT to the request object. This means we can access it later in the request-response cycle.
					req.userId = decodedAccessToken.userId;
					console.log('✅ User is free to go');
					// After doing our checks and attaching the user to the request, we call 'next()' to continue to the next middleware function in the stack, or the route handler if there's no other middleware.
					next();
				})
				.catch((error) => {
					console.log('⛔️ User shall not pass!!');
					throw new Error(error);
				});
		} catch (error) {
			console.log('⛔️⛔️ User shall not pass!!');

			console.error(error);
			// res.status(401).json({ error: 'User not authorized' });
			const errorPayload = new HttpException(
				'Unauthorized',
				HttpStatus.UNAUTHORIZED,
			);
			next(errorPayload);
		}
	}
}
