import {
	Body,
	Controller,
	Get,
	Post,
	Query,
	Redirect,
	Request,
	Res,
	UnauthorizedException,
	Req,
	HttpCode,
	NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { toDataURL } from 'qrcode';

interface AuthorizationResponse {
	url: string;
}

export interface CustomRequest extends Request {
	userId: number;
}

// TODO: implement a middleware that checks if the JWT token received with each request is correct

@Controller('login')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
	) {}

	@Get('auth')
	@Redirect() // this will automatically redirect to the URL returned by the function
	authorize(): AuthorizationResponse {
		return { url: this.authService.getAuthUrl() }; // generates the authorization URL and returns it
	}

	@Get('callback')
	@Redirect() // this will automatically redirect to the URL returned by the function
	async callback(
		@Query('code') code: string,
		@Query('state') state: string,
		@Res({ passthrough: true }) res: Response,
	) {
		// @Query extracts the code and state properties of the query from the URL that 42 redirects the user to
		// which would look something like "http://localhost:3000/callback?code=CODE_VALUE&state=STATE_VALUE"
		try {
			// check that the state we received is the same we setup on class construction
			this.authService.checkState(state);
			// Handle the authentication callback using the provided code
			await this.authService.handleAuthCallback(code);
			// Retrieve user information after successful authentication
			await this.authService.retrieveUserInfo();

			// Prepare the payload for generating tokens
			const payload = {
				userId: this.authService.getUserId(),
			};

			// Generate a temporary code that the front will use to get the access token
			const temporaryAuthCode = this.authService.generateTemporaryAuthCode();

			// Generate a new access token and a refresh token based on the payload
			// const accessToken = this.tokenService.generateAccessToken(payload);
			const refreshToken = await this.tokenService.generateRefreshToken(
				payload,
			);
			// TODO: error 401 due to asynchron issue ?
			// Attach the generated access and refresh tokens as cookies in the response
			// this.tokenService.attachAccessTokenCookie(res, accessToken);
			this.tokenService.attachRefreshTokenCookie(res, refreshToken);

			// Define the URL to redirect the user after successful authentication
			const redirectURL = `/retrieve-token` + '?code=' + temporaryAuthCode;
			return { url: redirectURL };
		} catch (error) {
			return { url: 'login-failed' }; // TODO: return error URl and find out how to customize the error message if we want to
		}
	}

	@Post('retrieve-access-token')
	async retrieveAccessTokenAndTwoFAStatus(
		@Body() body: { code: string },
	): Promise<{
		accessToken: string;
		twofa: boolean;
	}> {
		// Retrieve the code
		const { code } = body;
		console.log(code);
		// Check the code
		// if (!this.authService.checkTemporaryAuthCode(code))
		// 	throw new Error('Code is invalid, could not generate access token');
		// Generate the access token
		// Prepare the payload for generating tokens
		const payload = {
			userId: this.authService.getUserId(),
		};
		if (!payload.userId) throw new Error('User Id is empty');
		// Check that the user exists in our database
		const userExists = await this.authService.checkUserExists(payload.userId);
		if (!userExists) throw new Error('User not found in our database');
		// Generate access token
		const accessToken = this.tokenService.generateAccessToken(payload);
		// Delete the temporary authorization code
		this.authService.deleteTemporaryAuthCode();

		// verify if 2fa is enabled if so return true;
		const response = await this.authService.istwofaEnabled(payload.userId);

		return {
			accessToken: accessToken,
			twofa: response.isTwoFactorAuthenticationEnabled,
		};
	}

	@Get('success')
	loginSuccess(): string {
		return 'The user logged in successfully ✅';
	}

	@Get('login-failed')
	loginFailed(): string {
		return 'User could not login 🛑';
	}

	@Post('2fa/turn-on')
	async generateQrCodeDataURL(
		@Req() req: CustomRequest,
		@Body() body,
	): Promise<any> {
		// extract access token from header, decode it and retrieve userId
		const authorizationHeader = req.headers['authorization'];
		if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
			const accessToken = authorizationHeader.slice(7);
			const decodedAccessToken = this.tokenService.verifyToken(accessToken);
			if (!decodedAccessToken) {
				throw new NotFoundException('Authentication required');
			}

			// generate a 2fa secret and stores it in database and create a qr code url
			const otpAuthUrl = await this.authService.generate2faSecret(
				decodedAccessToken.userId,
			);
			console.log('🥎🥎🥎🥎 otpAuthUrl: ', otpAuthUrl);

			const qrCodeUrl = toDataURL(otpAuthUrl);

			// return qr code url
			return qrCodeUrl;
		}
	}

	@Post('2fa/turn-off')
	async turnOff2fa(@Req() req: CustomRequest) {
		const authorizationHeader = req.headers['authorization'];
		if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
			const accessToken = authorizationHeader.slice(7);
			const decodedAccessToken = this.tokenService.verifyToken(accessToken);
			if (!decodedAccessToken) {
				throw new NotFoundException('Authentication required');
			}
			//turning off the 2fa
			try {
				await this.authService.turnOffTwoFactorAuthentication(
					decodedAccessToken.userId,
				);
			} catch (e) {
				console.error('Could not turn off 2fa: ', e);
			}
		}
	}

	// TODO: send res.status
	// TODO: add verify token method with authorization header
	// TODO: handle error
	@Post('2fa/authenticate')
	@HttpCode(200)
	async authenticate(@Request() request, @Body() body) {
		console.log('🍉 2fa/authenticate', body.code);
		const authorizationHeader = request.headers['authorization'];
		if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
			const accessToken = authorizationHeader.slice(7);
			const decodedAccessToken = this.tokenService.verifyToken(accessToken);
			if (!decodedAccessToken) {
				throw new NotFoundException('Authentication required');
			}
			const isCodeValid =
				await this.authService.isTwoFactorAuthenticationCodeValid(
					body.code,
					decodedAccessToken.userId,
				);

			if (!isCodeValid) {
				throw new UnauthorizedException('Wrong authentication code');
			}

			return 'ok!';
		}
	}
}
