import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
	private readonly jwtSecretKey: string;
	private readonly accessTokenExpiresIn: number;
	private readonly refreshTokenExpiresIn: number;

	constructor() {
		this.jwtSecretKey = process.env.JWT_SECRET_KEY || 'your-default-secret-key';
		this.accessTokenExpiresIn = 30; // Access token expiry time in seconds
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
}

// async refreshAccessToken(refreshToken: string): Promise<string | null> {
//     try {
//         // Verify the refresh token
//         const decoded = jwt.verify(
//             refreshToken,
//             process.env.JWT_REFRESH_SECRET_KEY,
//         ) as jwt.JwtPayload;

//         // Check if the refresh token is valid
//         const user = await this.prisma.user.findUnique({
//             where: { id: decoded.userId },
//         });
//         if (!user) {
//             throw new Error('Invalid refresh token');
//         }

//         // If the refresh token is valid, generate a new access token and return it
//         const payload = {
//             userId: user.id,
//         };
//         const accessTokenExpiresIn = 3600; // Token expiry time (in seconds)
//         const accessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//             expiresIn: accessTokenExpiresIn,
//         });

//         return accessToken;
//     } catch (error) {
//         console.log('Error refreshing access token:', error);
//         return null; // Return null if the refresh token is invalid or expired
//     }
