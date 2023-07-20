import { Injectable, NestMiddleware, Redirect } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// TODO: Here I should use the same interface type for request as the once I put in user.controller.ts,
// interface CustomRequest extends Request {
// 	userId: number;
// }
// I should put it in a separate file and import it from all necessary files

// We use @Injectable decorator provided by NestJS here to mark this class as a provider that can be managed by the NestJS's dependency injection system.
@Injectable()
export class AuthMiddleWare implements NestMiddleware {
	// The use method is what we implement as part of the NestMiddleware interface. It gets executed when a middleware function is invoked.
	// This method has three parameters: req (which represents the request object), res (which represents the response object), and next (which is a callback to invoke the next middleware function).
	use(req: any, res: Response, next: NextFunction) {
		// Here, we extract the JWT from the cookies sent with the request.
		const token = req.cookies['jwt'];
		try {
			// Now, we verify the JWT using the secret key.
			// If the token is valid, jwt.verify returns the payload of the token (the data that was initially stored in the token when it was signed).
			// If the token is not valid (maybe it was tampered with, or it's expired), jwt.verify throws an error.
			const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
			// Check that the user is indeed part of our database (maybe they are using an old cookie, should not happen but does not hurt to check)
			const userPromise = prisma.user.findUnique({
				where: { id: decoded.userId },
			});

			userPromise
				.then((user) => {
					if (!user) throw new Error('Request coming from unknown user');
					// If the token is verified, we attach the payload of the JWT to the request object. This means we can access it later in the request-response cycle.
					req.userId = decoded.userId;
					// After doing our checks and attaching the user to the request, we call 'next()' to continue to the next middleware function in the stack, or the route handler if there's no other middleware.
					next();
				})
				.catch((error) => {
					throw new Error(error);
				});
		} catch (error) {
			// If there was an error when trying to verify the JWT (meaning it's not a valid token), we return a 401 Unauthorized status code and a JSON object with an error message.
			res.status(401).json({ message: 'Authentication failed :(' + error });
		}
	}
}
