import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
// import { ExpressAdapter } from '@nestjs/platform-express';
import { rateLimit } from 'express-rate-limit';

// Configure dotenv
config();

async function bootstrap() {
	const expressApp = express();
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: ['http://localhost:3001', 'http://localhost:8080'], // Allow requests from this origin
		credentials: true, // Allow credentials (cookies, for us)
	});
	app.use(cookieParser());
	app.use(
		'/images',
		express.static(
			join(
				__dirname,
				'..',
				'src',
				'services',
				'database-setup',
				'default-images',
			),
		),
	);

	// rate limit configuration
	const apiLimiter = rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
		standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy` headers
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
		validate: { trustProxy: false },
	});

	app.use(apiLimiter);

	await app.listen(3000, '0.0.0.0').catch((error) => {
		console.error('Error starting the application:', error);
	});
}
bootstrap();
