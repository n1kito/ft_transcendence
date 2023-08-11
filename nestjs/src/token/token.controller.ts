import { Controller, Post, Req, Res } from '@nestjs/common';
import { TokenService } from './token.service';
import { Response, Request } from 'express';
import { PrismaService } from 'src/services/prisma-service/prisma.service';

@Controller('token')
export class TokenController {
	constructor(private readonly tokenService: TokenService) {}

	@Post('/refresh-token')
	async refreshToken(@Req() req: Request, @Res() res: Response) {
		try {
			// generate a new access token
			const newAccessToken = await this.tokenService.refreshToken(req);
			// Send the new access token as a cookie
			this.tokenService.attachAccessTokenCookie(res, newAccessToken);
			return res
				.status(200)
				.json({ message: 'Access token refreshed successfully' });
		} catch (error) {
			return res
				.status(401)
				.json({ error: 'Invalid or expired refresh token' });
		}
	}
}
