import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

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

	await app.listen(3000, '0.0.0.0').catch((error) => {
		console.error('Error starting the application:', error);
	});
}
bootstrap();
