import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

interface AuthorizationResponse {
	url: string;
}

// TODO: implement a middleware that checks if the JWT token received with each request is correct

@Controller('login')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
			await this.authService.handleAuthCallback(code);
			await this.authService.retrieveUserInfo();
			// TODO: put in a separate method ?
			// generate JWT token
			const payload = {
				userId: this.authService.getUserId(),
			};
			const secretKey = process.env.JWT_SECRET_KEY;
			const expiresIn = 3600; // Token expiry time (in seconds)
			const token = jwt.sign(payload, secretKey, {
				expiresIn,
			});
			// Attach the token to the response as a cookie
			res.cookie('jwt', token, {
				httpOnly: true,
				sameSite: 'strict',
				// TODO: set this to true for production only, as it sends it over https and https is not used in local environments
				// secure: true,
				expires: new Date(Date.now() + expiresIn * 1000),  // Set cookie to expire when the JWT does
			});
			const redirectURL = `http://localhost:3001/desktop`;
			return { url: redirectURL }; // TODO: return 'desktop' (homepage) URL
		} catch {
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
