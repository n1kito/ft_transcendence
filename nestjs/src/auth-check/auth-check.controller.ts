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
}
