import {
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Req,
} from '@nestjs/common';
import { AuthCheckService } from './auth-check.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Controller('auth-check')
export class AuthCheckController {
	constructor(private readonly authCheckService: AuthCheckService) {}
	// TODO: do we need a separate service here ? It's a simple check
	@Get()
	async checkAuth(
		@Req() req: Request,
	): Promise<{ isAuthentificated: boolean }> {
		try {
			const token = req.cookies['accessToken'];
			const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
			const isAuthentificated = !!decoded;
			return { isAuthentificated };
		} catch (error) {
			console.log('\n\n----------AUTH CHECK-------------\n\n');
			console.log('user is not authenticated cannot find access token', error);
			return { isAuthentificated: false };
		}
	}
	@Post('decode-token')
	async decodeToken(@Req() req): Promise<any> {
		try {
			console.log('\n\n---------DECODE TOKEN --------------\n\n');

			const token = req.cookies?.accessToken;

			if (!token) {
				throw new HttpException(
					'Access token not found',
					HttpStatus.UNAUTHORIZED,
				);
			}

			// Now you can verify the token
			const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

			console.log(decodedToken);
			return { isAuthentificated: true };
		} catch (error) {
			console.log('error:', error);
			throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
		}
	}
}
