import { Injectable, Req } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class TokenService {
	private readonly jwtSecretKey: string;
	private readonly accessTokenExpiresIn: number;
	private readonly refreshTokenExpiresIn: number;

	constructor() {
		this.jwtSecretKey = process.env.JWT_SECRET_KEY || 'your-default-secret-key';
		this.accessTokenExpiresIn = 10; // Access token expiry time in seconds
		this.refreshTokenExpiresIn = 30 * 24 * 60 * 60; // Refresh token expiry time in seconds
	}

	generateAccessToken(payload: any): string {
		console.log('generate access token payload : ', payload);
		const secretKey = process.env.JWT_SECRET_KEY;
		const accessToken = jwt.sign(payload, secretKey, {
			expiresIn: this.accessTokenExpiresIn,
		});
		return accessToken;
	}

	// Method to verify a token and return the payload
	verifyToken(token: string): any {
		return jwt.verify(token, this.jwtSecretKey) as jwt.JwtPayload;
		// return jwt.verify(token);
	}

	async refreshToken(@Req() req: Request): Promise<string> {
		const refreshToken = req.cookies['refreshToken'];

		if (!refreshToken) {
			throw new Error('No refresh token provided');
		}

		try {
			// Verify the refresh token
			const decodedRefreshToken = this.verifyToken(refreshToken);
			// You can fetch the user from the database based on the decoded data
			// For example, if your refresh token contains a user ID:
			const userId = decodedRefreshToken.userId;

			// ... Fetch the user from the database based on userId

			// Generate a new access token
			const accessToken = jwt.sign({ userId }, this.jwtSecretKey, {
				expiresIn: this.accessTokenExpiresIn,
			});
			console.log(accessToken);
			return accessToken;
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}
}
