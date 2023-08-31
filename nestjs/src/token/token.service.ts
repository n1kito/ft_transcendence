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

	constructor(private readonly prisma: PrismaService) {
		this.jwtSecretKey = process.env.JWT_SECRET_KEY;
		this.accessTokenExpiresIn = 10 * 60; // Access token expiry time in seconds
		this.refreshTokenExpiresIn = 30 * 24 * 60 * 60; // Refresh token expiry time in seconds
	}

	// Generate an access token using the payload and secret key
	// Set the expiration time for the token using accessTokenExpiresIn
	generateAccessToken(payload: any): string {
		const accessToken = jwt.sign(payload, this.jwtSecretKey, {
			expiresIn: this.accessTokenExpiresIn,
		});
		console.log('generate access token:', accessToken);
		return accessToken;
	}

	// Generate a refresh token using the payload and secret key
	// Set the expiration time for the token using refreshTokenExpiresIn
	async generateRefreshToken(payload: any): Promise<string> {
		const refreshToken = jwt.sign(payload, this.jwtSecretKey, {
			expiresIn: this.refreshTokenExpiresIn,
		});
		console.log('generate refresh token:', refreshToken);
		return refreshToken;
	}

	

	// Method to verify a token and return the payload
	verifyToken(token: string): any {
		return jwt.verify(token, this.jwtSecretKey) as jwt.JwtPayload;
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

	// Method to attach an access token as a cookie in request
	attachAccessTokenCookie(res: Response, accessToken: string): void {
		this.attachTokenAsCookie(
			res,
			'accessToken',
			accessToken,
			this.accessTokenExpiresIn,
		);
	}

	// Method to attach a refresh token as a cookie in request
	attachRefreshTokenCookie(res: Response, refreshToken: string): void {
		this.attachTokenAsCookie(
			res,
			'refreshToken',
			refreshToken,
			this.refreshTokenExpiresIn,
		);
	}

	// After refresh token and userId are verified,
	// generate a new access token
	async refreshToken(@Req() req: Request): Promise<string> {
		try {
			// retrieve refreshToken from cookies in request
			const refreshToken = req.cookies['refreshToken'];

			// Verify the refresh token
			const decodedRefreshToken = this.verifyToken(refreshToken);

			// Extract userId from the decoded refresh token
			const userId = decodedRefreshToken.userId;

			// Fetch the user from the database based on userId
			const user = await this.prisma.findUserById(userId);

			// If user not found in db, user is invalid then throw error
			if (!user) throw new Error('user does not exist');

			// If user is valid, generate a new access token
			const newAccessToken = this.generateAccessToken({ userId });

			return newAccessToken;
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}
}
