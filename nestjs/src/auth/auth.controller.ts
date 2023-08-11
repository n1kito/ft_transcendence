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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';
import { TokenService } from 'src/token/token.service';

interface AuthorizationResponse {
	url: string;
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

			// Generate a new access token and a refresh token based on the payload
			const accessToken = this.tokenService.generateAccessToken(payload);
			const refreshToken = this.tokenService.generateRefreshToken(payload);

			// Attach the generated access and refresh tokens as cookies in the response
			this.tokenService.attachAccessTokenCookie(res, accessToken);
			this.tokenService.attachRefreshTokenCookie(res, refreshToken);

			// Define the URL to redirect the user after successful authentication
			const redirectURL = `http://localhost:3001/desktop`;
			return { url: redirectURL };
		} catch (error) {
			return { url: 'login-failed' }; // TODO: return error URl and find out how to customize the error message if we want to
		}
	}

	@Get('success')
	loginSuccess(): string {
		return 'The user logged in successfully ✅';
	}

	@Get('login-failed')
	loginFailed(): string {
		return 'User could not login 🛑';
	}
}
