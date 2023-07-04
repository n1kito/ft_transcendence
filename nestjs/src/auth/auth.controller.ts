import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';

interface AuthorizationResponse {
	url: string;
}

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
	async callback(@Query('code') code: string, @Query('state') state: string) {
		// @Query extracts the code and state properties of the query from the URL that 42 redirects the user to
		// which would look something like "http://localhost:3000/callback?code=CODE_VALUE&state=STATE_VALUE"
		try {
			// check that the state we received is the same we setup on class construction
			this.authService.checkState(state);
			await this.authService.handleAuthCallback(code);
			return { url: 'success' }; // TODO: return 'desktop' (homepage) URL
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
