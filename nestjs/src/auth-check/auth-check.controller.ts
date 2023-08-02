import { Controller, Get, Req } from '@nestjs/common';
import { AuthCheckService } from './auth-check.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

@Controller('auth-check')
export class AuthCheckController {
	constructor(private readonly authCheckService: AuthCheckService) {}
	// TODO: do we need a separate service here ? It's a simple check
	@Get()
	checkAuth(@Req() req: Request): { isAuthentificated: boolean } {
		try {
			const token = req.cookies['accessToken'];
			const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
			const isAuthentificated = !!decoded;
			return { isAuthentificated };
		} catch (error) {
			return { isAuthentificated: false };
		}
	}
}
