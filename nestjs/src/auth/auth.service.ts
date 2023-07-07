import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
	// Define necessary variables
	private readonly clientID: string;
	private readonly secret: string;
	private readonly redirectUri: string;
	private readonly ftApiAuthUrl: string;
	private readonly ftApiTokenUrl: string;
	private readonly stateRandomString: string;

	// initialize the variables
	constructor() {
		console.log();
		this.clientID = process.env.FT_UID;
		this.secret = process.env.FT_SECRET;
		this.redirectUri = 'http://localhost:3000/login/callback';
		this.ftApiAuthUrl = 'https://api.intra.42.fr/oauth/authorize';
		this.ftApiTokenUrl = 'https://api.intra.42.fr/oauth/token';
		this.stateRandomString = randomBytes(16).toString('hex');
	}

	// generate the authorization URL following the 42 documentation
	getAuthUrl(): string {
		const parameters = new URLSearchParams({
			client_id: this.clientID,
			redirect_uri: this.redirectUri,
			scope: 'public',
			state: this.stateRandomString,
			response_type: 'code',
		});
		// return the URL that the calling function (in controller) will automatically redirect to
		return this.ftApiAuthUrl + '?' + parameters;
	}

	// once 42 redirects to our server after authenficiating with a special code,
	// we want to exchange that code for a token and a refresh token. This implies sending one more
	// request to the 42 API. Then we can redirect the user to either success page or error page.
	async handleAuthCallback(code: string): Promise<void> {
		const parameters = new URLSearchParams({
			grant_type: 'authorization_code',
			client_id: this.clientID,
			client_secret: this.secret,
			code: code,
			redirect_uri: this.redirectUri,
			state: this.stateRandomString,
		});
		// Request token echange to 42
		const response = await fetch(this.ftApiTokenUrl + '?' + parameters, {
			method: 'POST',
		});
		// Once the response is received, we can parse it
		const data = await response.json();
		// TODO: this response does not contain the state I pass to it, why ?
		console.log(data);
		if (!data.access_token.length)
			throw new Error('Could not get access token');
	}

	checkState(state: string) {
		// TODO: how can we show the error to the end user ?
		if (state != this.stateRandomString)
			throw new Error('State strings do not match');
	}
}
