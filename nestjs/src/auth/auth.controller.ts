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
	Put,
	ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { toDataURL } from 'qrcode';
import { twoFactorAuthenticationCodeDto } from './dto/two-factor-auth-code.dto';

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

			this.tokenService.attachRefreshTokenCookie(res, refreshToken);

			// Define the URL to redirect the user after successful authentication
			const redirectURL = `/retrieve-token` + '?code=' + temporaryAuthCode;
			return { url: redirectURL };
		} catch (error) {
			return { url: 'login-failed' }; // TODO: return error URl and find out how to customize the error message if we want to
		}
	}

	// Create and return an access token with jwt
	// Also inform if user has enabled two-factor authentication
	@Post('retrieve-access-token')
	async retrieveAccessTokenAndTwoFAStatus(
		@Body() body: { code: string },
	): Promise<{
		accessToken: string;
		isTwoFactorAuthenticationEnabled: boolean;
	}> {
		// Retrieve the code
		const { code } = body;
		// Check the code
		if (!this.authService.checkTemporaryAuthCode(code))
			throw new Error('Code is invalid, could not generate access token');
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
		const isTwoFactorAuthenticationEnabled =
			await this.authService.istwofaEnabled(payload.userId);

		// return access token and two-factor authentication state
		return {
			accessToken: accessToken,
			isTwoFactorAuthenticationEnabled: isTwoFactorAuthenticationEnabled,
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

	// if user enables two-factor authentication, generate a secret
	// and create a one-time qr code to link the user and chamaje
	// via google authenticator
	@Post('2fa/turn-on')
	async turnOn2fa(@Request() request, @Body() body): Promise<any> {
		// extract access token from header, decode it and retrieve userId
		const userId = this.tokenService.ExtractUserId(
			request.headers['authorization'],
		);
		if (!userId)
			throw new Error('Invalid access token: user is not authorized');

		// generate a 2fa secret and stores it in database and create a
		// one-time password authentication URL
		const oneTimePasswordAuthUrl = await this.authService.generate2faSecret(
			userId,
		);
		// convert one-time password authentication url to QR code url
		const qrCodeUrl = toDataURL(oneTimePasswordAuthUrl);
		// return qr code url
		return qrCodeUrl;
	}

	@Post('2fa/turn-off')
	async turnOff2fa(@Request() request, @Res() res) {
		try {
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			const ret = await this.authService.turnOffTwoFactorAuthentication(userId);
			return res.status(200).json({ message: ret });
		} catch (error) {
			return res.status(400).json({ message: error });
		}
	}

	@Post('2fa/authenticate')
	@HttpCode(200)
	async authenticate2fa(
		@Request() request,
		@Body(new ValidationPipe())
		{ twoFactorAuthenticationCode }: twoFactorAuthenticationCodeDto,
		@Res() res,
	) {
		try {
			// verifiy access token and retrieve userId
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);
			// verify one time password submitted by the user
			const isCodeValid =
				await this.authService.isTwoFactorAuthenticationCodeValid(
					twoFactorAuthenticationCode,
					userId,
				);
			// if one time password is invalid, return error
			if (!isCodeValid) {
				return res.status(401).json({ message: 'Invalid two-factor code' });
			}
			// else return 2FA authentication success
			return res
				.status(200)
				.json({ message: 'two-factor authentication enabled!' });
		} catch (error) {
			return res.status(400).json({ message: error });
		}
	}

	@Put('logout')
	async logOut(
		@Request() request,
		@Body() body: { state: boolean },
		@Res() res,
	): Promise<any> {
		try {
			// verifiy access token and retrieve userId
			const userId = this.tokenService.ExtractUserId(
				request.headers['authorization'],
			);

			// set isTwoFactorAuthenticationVerified status to false
			// this way, when the user logs out, has to enter a new one-time password
			// generated by google authenticator
			this.authService.updateVerifyStatus(userId, false);

			// revoke refresh token
			res.cookie('refreshToken', '', {
				httpOnly: true,
				expires: new Date(0), // Set expiration to a past date
			});
			return res.status(200).json({ message: 'successful 2FA log out' });
		} catch (error) {
			return res.status(400).json({ message: 'error 2FA log out' });
		}
	}
}
