import { Injectable, NotFoundException, Req } from '@nestjs/common';
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
		this.accessTokenExpiresIn = 100 * 60; // Access token expiry time in seconds
		this.refreshTokenExpiresIn = 30 * 24 * 60 * 60; // Refresh token expiry time in seconds
	}

	// Generate an access token using the payload and secret key
	// Set the expiration time for the token using accessTokenExpiresIn
	generateAccessToken(payload: any): string {
		const accessToken = jwt.sign(payload, this.jwtSecretKey, {
			expiresIn: this.accessTokenExpiresIn,
		});
		return accessToken;
	}

	// Generate a refresh token using the payload and secret key
	// Set the expiration time for the token using refreshTokenExpiresIn
	async generateRefreshToken(payload: any): Promise<string> {
		const refreshToken = jwt.sign(payload, this.jwtSecretKey, {
			expiresIn: this.refreshTokenExpiresIn,
		});
		return refreshToken;
	}

	// from authorization header, extract access token and retrieve userId
	// by verifying it with jwt
	ExtractUserId(authorizationHeader: string): number {
		// check if authorization header is valid
		if (!authorizationHeader || !authorizationHeader.startsWith('Bearer '))
			throw new Error('wrong authorization header');

		// extract access token from header
		const accessToken = authorizationHeader.slice(7);

		// verify access token wit jwt
		const decodedAccessToken = this.verifyToken(accessToken);
		if (!decodedAccessToken)
			throw new NotFoundException('Authentication required');

		// return userId
		return decodedAccessToken.userId;
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
	async refreshToken(@Req() req: Request): Promise<{
		accessToken: string;
		isTwoFactorAuthEnabled: boolean;
		isTwoFactorAuthVerified: boolean;
	}> {
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

			// let isTwoFactorAuthEnabled: boolean;
			const response = await this.prisma.user.findUnique({
				where: { id: userId },
			});

			return {
				accessToken: newAccessToken,
				isTwoFactorAuthEnabled: response.isTwoFactorAuthenticationEnabled,
				isTwoFactorAuthVerified: response.isTwoFactorAuthenticationVerified,
			};
		} catch (error) {
			throw new Error('Invalid or expired refresh token');
		}
	}
}
