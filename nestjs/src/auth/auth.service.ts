import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaClient, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface UserData {
	ft_id: number;
	login: string;
	email: string;
	hash: string;
	image: string;
}

@Injectable()
export class AuthService {
	// Define necessary variables
	private readonly clientID: string;
	private readonly secret: string;
	private readonly redirectUri: string;
	private readonly ftApiAuthUrl: string;
	private readonly ftApiTokenUrl: string;
	private readonly ftApiFetchUrl: string;
	private readonly stateRandomString: string;
	private temporaryAuthCode: string;
	private token: string;
	private userId: number; // TODO: do we need this ? Added so we could add it to JWT token
	private userData: UserData;
	private temporaryCode: string;

	private readonly prisma: PrismaClient;

	// TODO: this is retrieved locally and it's not correct, we should retrieve from the database
	getLogin(): string {
		return this.userData.login;
	}

	// initialize the variables
	constructor() {
		console.log();
		this.clientID = process.env.FT_UID;
		this.secret = process.env.FT_SECRET;
		this.redirectUri = 'http://localhost:8080/api/login/callback';
		this.ftApiAuthUrl = 'https://api.intra.42.fr/oauth/authorize';
		this.ftApiTokenUrl = 'https://api.intra.42.fr/oauth/token';
		this.ftApiFetchUrl = 'https://api.intra.42.fr/v2/me';
		this.stateRandomString = randomBytes(16).toString('hex');
		this.prisma = new PrismaClient();
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
		this.token = data.access_token;
	}

	checkState(state: string) {
		// TODO: how can we show the error to the end user ?
		if (state != this.stateRandomString)
			throw new Error('State strings do not match');
	}

	// Use a fetch request using the 42 token to retrieve the information we want about the user
	async retrieveUserInfo() {
		// make fetch data to retriece user info
		try {
			// Make a fetch request to the 42 API
			const requestOptions = {
				headers: {
					Authorization: `Bearer ${this.token}`,
				},
			};
			const response = await fetch(this.ftApiFetchUrl, requestOptions);
			if (!response.ok) {
				throw new Error('Fetch request failed');
			}
			// Parse the received data to json
			const responseData = await response.json();
			this.userData = {
				ft_id: responseData.id,
				login: responseData.login,
				email: responseData.email,
				hash: 'temporary password',
				image: responseData.image.versions.small,
			};

			// TODO: add try/catch around this if we want to have more precise error logs ?
			// Find the user in our database
			const userInDb = await this.prisma.user.findUnique({
				where: { ft_id: this.userData.ft_id },
			});
			// If the user was not found, create it with the retrieved data
			if (userInDb == null) {
				const newUser = await this.prisma.user.create({
					data: this.userData,
				});
				// give the user some default friends
				// TODO: add our 5 default users as the new user's friend
				await this.addDefaultUsersAsFriends(newUser);
				// Store the user id in the local object, so we can use it in the JWT token
				this.userId = newUser.id;
			}
			// if the user already exists, update their information (if they have not manually overwritten it themselves)
			else await this.updateUserInfo(userInDb);
			// this.yourDataRepository.save(mappedData);
			this.userId = userInDb.id;
		} catch (error) {
			// TODO:: handle error accordingly
			console.log(error);
		}
	}

	// TODO: test that this works once the profile update process has been setup
	// Updates user info on login depending on whether those values where manually updated by the user or not
	async updateUserInfo(userInDb: User) {
		await this.prisma.user.update({
			where: { ft_id: userInDb.ft_id },
			data: {
				login: !userInDb.login_is_locked ? this.userData.login : undefined,
				email: !userInDb.email_is_locked ? this.userData.email : undefined,
				image: !userInDb.image_is_locked ? this.userData.image : undefined,
			},
		});
		// Store the user id in the local object, so we can use it in the JWT token
		this.userId = userInDb.id;
	}

	getUserId() {
		return this.userId;
	}

	async addDefaultUsersAsFriends(user: User) {
		// Fetch all of our default friends from our database
		const defaultUsers = await this.prisma.user.findMany({
			where: {
				isDefaultProfile: true,
			},
		});
		// For each of them, add them as a friend of our user, and vice-versa
		const friendUpdates = defaultUsers
			.map((currentDefaultUser) => {
				// TODO: check is the default users are not already friends with our main user
				// but this should not be possible since this is only done on entry creation
				return [
					this.prisma.user.update({
						where: { id: user.id },
						data: {
							friends: {
								connect: { id: currentDefaultUser.id },
							},
						},
					}),
					this.prisma.user.update({
						where: { id: currentDefaultUser.id },
						data: {
							friends: {
								connect: { id: user.id },
							},
						},
					}),
				];
			})
			.flat(); // this allows us to turn the updated variables from an array of arrays, into a simple array by combining its values
		// Execute all the updates in a single prisma transaction
		// Since this is a transation, if any of the updates fail, the DB will be reverted to its original state, before the updated where attempted
		try {
			await this.prisma.$transaction(friendUpdates);
		} catch (error) {
			console.error('Could not add default users as friends: ', error);
		}
	}

	generateTemporaryAuthCode(): string {
		this.temporaryAuthCode = randomBytes(16).toString('hex');
		return this.temporaryAuthCode;
	}

	deleteTemporaryAuthCode() {
		this.temporaryAuthCode = '';
	}

	checkTemporaryAuthCode(codeToCheck: string): boolean {
		if (!codeToCheck.length || codeToCheck != this.temporaryAuthCode)
			return false;
		return true;
	}

	async checkUserExists(userId: number): Promise<boolean> {
		// Check that the userId is not undefined
		if (!userId) return false;
		// Check that the userId corresponds to an actual user in our databse
		const userInDb = await this.prisma.user.findUnique({
			where: { id: userId },
		});
		// If not, return false
		if (!userInDb) return false;
		// Else
		return true;
	}
}

export default AuthService;
