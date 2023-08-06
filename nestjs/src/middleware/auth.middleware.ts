import { Injectable, NestMiddleware, Redirect } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { TokenService } from 'src/token/token.service';

const prisma = new PrismaClient();

// TODO: Here I should use the same interface type for request as the once I put in user.controller.ts,
// interface CustomRequest extends Request {
// 	userId: number;
// }
// I should put it in a separate file and import it from all necessary files

// We use @Injectable decorator provided by NestJS here to mark this class as a provider that can be managed by the NestJS's dependency injection system.
@Injectable()
export class AuthMiddleWare implements NestMiddleware {
	constructor(private readonly tokenService: TokenService) {}
	// The use method is what we implement as part of the NestMiddleware interface. It gets executed when a middleware function is invoked.
	// This method has three parameters: req (which represents the request object), res (which represents the response object), and next (which is a callback to invoke the next middleware function).
	async use(req: any, res: Response, next: NextFunction) {
		console.log('\n\n--------------AUTH MIDDLEWARE--------------------\n\n');
		// Here, we extract the JWT from the cookies sent with the request.
		const accessToken = req.cookies['accessToken'];
		const refreshToken = req.cookies['refreshToken'];

		console.log('access token:', accessToken);
		console.log('refresh token:', refreshToken);

		try {
			// Now, we verify the JWT using the secret key.
			// If the token is valid, jwt.verify returns the payload of the token (the data that was initially stored in the token when it was signed).
			// If the token is not valid (maybe it was tampered with, or it's expired), jwt.verify throws an error.
			const decodedAccessToken = this.tokenService.verifyToken(accessToken);

			// verify if refresh token is valid
			const decodedRefreshToken = jwt.verify(
				refreshToken,
				process.env.JWT_SECRET_KEY,
			) as jwt.JwtPayload;

			// Check that the user is indeed part of our database (maybe they are using an old cookie, should not happen but does not hurt to check)
			const userPromise = prisma.user.findUnique({
				where: { id: decodedAccessToken.userId },
			});

			userPromise
				.then((user) => {
					if (!user) throw new Error('Request coming from unknown user');
					// If the token is verified, we attach the payload of the JWT to the request object. This means we can access it later in the request-response cycle.
					req.userId = decodedAccessToken.userId;
					// After doing our checks and attaching the user to the request, we call 'next()' to continue to the next middleware function in the stack, or the route handler if there's no other middleware.
					next();
				})
				.catch((error) => {
					throw new Error(error);
				});
			// return next();
		} catch (error) {
			console.log('\n\n----------- middleware error -----------\n\n', error);
			console.log('error name', error.name);
			if (
				error.name === 'TokenExpiredError' ||
				error.name === 'JsonWebTokenError'
			) {
				const decodedRefreshToken = jwt.verify(
					refreshToken,
					process.env.JWT_SECRET_KEY,
				) as jwt.JwtPayload;

				const user = await prisma.user.findUnique({
					where: { id: decodedRefreshToken.userId },
				});
				if (!user) {
					throw new Error('Request coming from unknown user');
				}
				const payload = {
					userId: user.id,
				};
				//token has expired then generate a new access token
				const newAccessToken = this.tokenService.generateAccessToken(payload);

				// send the new access token as a cookie
				res.cookie('accessToken', newAccessToken, {
					httpOnly: true,
				});

				req.accessToken = newAccessToken;
				req.userId = decodedRefreshToken.userId;
				console.log('expired access token has been replaced by a new one!');
				return next();
			}

			res.status(401).json({ message: 'Authentication failed :(' + error });
		}
	}
}
