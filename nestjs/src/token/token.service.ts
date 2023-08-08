import { Injectable, Req } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { StringifyOptions } from 'querystring';
import { PrismaService } from 'src/services/prisma-service/prisma.service';

@Injectable()
export class TokenService {
	private readonly jwtSecretKey: string;
	private readonly accessTokenExpiresIn: number;
	private readonly refreshTokenExpiresIn: number;
	private readonly prisma: PrismaService;

	constructor() {
		this.jwtSecretKey = process.env.JWT_SECRET_KEY;
		this.accessTokenExpiresIn = 10; // Access token expiry time in seconds
		this.refreshTokenExpiresIn = 30 * 24 * 60 * 60; // Refresh token expiry time in seconds
	}

	generateAccessToken(payload: any): string {
		const secretKey = process.env.JWT_SECRET_KEY;
		const accessToken = jwt.sign(payload, secretKey, {
			expiresIn: this.accessTokenExpiresIn,
		});
		console.log('generate access token:', accessToken);
		return accessToken;
	}

	generateRefreshToken(payload: any): string {
		const secretKey = process.env.JWT_SECRET_KEY;
		const refreshToken = jwt.sign(payload, secretKey, {
			expiresIn: this.refreshTokenExpiresIn,
		});
		console.log('generate refresh token:', refreshToken);
		return refreshToken;
	}

	// Method to verify a token and return the payload
	verifyToken(token: string): any {
		return jwt.verify(token, this.jwtSecretKey) as jwt.JwtPayload;
		// return jwt.verify(token);
	}

	// Method to attach a token as a cookie with specified settings
	private attachTokenAsCookie(
		res: Response,
		tokenName: string,
		tokenValue: string,
		expiresIn: number,
	): void {
		res.cookie(tokenName, tokenValue, {
			httpOnly: true,
			sameSite: 'strict',
			// TODO: set this to true for production only, as it sends it over https and https is not used in local environments
			// secure: true,
			expires: new Date(Date.now() + expiresIn * 1000),
		});
	}

	// Method to attach an access token as a cookie
	attachAccessTokenCookie(res: Response, accessToken: string): void {
		this.attachTokenAsCookie(
			res,
			'accessToken',
			accessToken,
			this.accessTokenExpiresIn,
		);
	}

	// Method to attach a refresh token as a cookie
	attachRefreshTokenCookie(res: Response, refreshToken: string): void {
		this.attachTokenAsCookie(
			res,
			'refreshToken',
			refreshToken,
			this.refreshTokenExpiresIn,
		);
	}

	async storeRefreshToken(userId: number, refreshToken: string) {
		const createdRefreshToken = await this.prisma.refreshToken.create({
			data: {
				id: userId, // Associate with the user
				userId: userId,
				token: refreshToken,
				createdAt: Date(),
				updatedAt: Date(),
			},
		});
	}

	async refreshToken(@Req() req: Request): Promise<string> {
		const refreshToken = req.cookies['refreshToken'];

		// if (!refreshToken) {
		// throw new Error('No refresh token provided');
		// }

		try {
			// Verify the refresh token
			const decodedRefreshToken = this.verifyToken(refreshToken);

			// You can fetch the user from the database based on the decoded data
			const userId = decodedRefreshToken.userId;

			// Fetch the user from the database based on userId

			// Generate a new access token
			const accessToken = jwt.sign({ userId }, this.jwtSecretKey, {
				expiresIn: this.accessTokenExpiresIn,
			});
			return accessToken;
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}
}
