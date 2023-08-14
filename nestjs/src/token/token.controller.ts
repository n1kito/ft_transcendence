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
			res.status(200);
			console.log('Finished refreshing, returning new access token');
			res.send({ accessToken: newAccessToken });
		} catch (error) {
			throw new Error('Could not refresh token: ' + error);
		}
	}
}
