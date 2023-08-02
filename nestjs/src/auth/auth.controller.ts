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
			await this.authService.handleAuthCallback(code);
			await this.authService.retrieveUserInfo();
			// TODO: put in a separate method ?
			// generate JWT token
			const payload = {
				userId: this.authService.getUserId(),
			};
			console.log('auth controller', payload);
			const secretKey = process.env.JWT_SECRET_KEY;
			const accessTokenExpiresIn = 30; // Token expiry time (in seconds)
			const accessToken = jwt.sign(payload, secretKey, {
				expiresIn: accessTokenExpiresIn,
			});

			const refreshTokenExpiresIn = 30 * 24 * 60 * 40;
			const refreshToken = jwt.sign(payload, secretKey, {
				expiresIn: refreshTokenExpiresIn,
			});

			// Attach the token to the response as a cookie
			res.cookie('accessToken', accessToken, {
				httpOnly: true,
				sameSite: 'strict',
				// TODO: set this to true for production only, as it sends it over https and https is not used in local environments
				// secure: true,
				expires: new Date(Date.now() + accessTokenExpiresIn * 1000), // Set cookie to expire when the JWT does
			});

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				sameSite: 'strict',
				expires: new Date(Date.now() + refreshTokenExpiresIn * 1000),
			});
			console.log('callback');
			const redirectURL = `http://localhost:3001/desktop`;
			return { url: redirectURL }; // TODO: return 'desktop' (homepage) URL
		} catch (error) {
			console.log('lofin error: ', error);
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

	@Post('refresh-token')
	async refreshToken(@Request() req, @Res() res) {
		// get refresh token from the request headers
		const refreshToken = req.headers['refreshToken'];

		console.log('/refresh-token:', refreshToken);

		if (!refreshToken) {
			throw new UnauthorizedException('No refresh token provided');
		}

		try {
			// Verify the refresh token
			const payload = this.tokenService.verifyToken(refreshToken);

			// If the refresh token is valid, generate a new access token
			const newAccessToken = this.tokenService.generateAccessToken(
				this.authService.getUserId,
			);

			res.cookie('accessToken', newAccessToken, {
				httpOnly: true,
			});

			return { accessToken: newAccessToken };
		} catch (error) {
			res.clearCookie('accessToken');
			throw new UnauthorizedException('Invalid or expired refresh token');
		}
	}
	@Post('decode-token')
	async decodeToken(@Body() body: { token: string }): Promise<any> {
		try {
			const decodedToken = jwt.verify(body.token);
			return { isValid: true, decodedToken };
		} catch (error) {
			return { isValid: false };
		}
	}
}
