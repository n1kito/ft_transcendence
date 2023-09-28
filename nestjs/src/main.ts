import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ExpressAdapter } from '@nestjs/platform-express';

// Configure dotenv
config();

async function bootstrap() {
	const app = await NestFactory.create(
		AppModule,
		new ExpressAdapter(express()),
	);
	app.enableCors({
		origin: ['http://localhost:3001', 'http://localhost:8080'], // Allow requests from this origin
		credentials: true, // Allow credentials (cookies, for us)
	});
	app.use(cookieParser());

	// Setup a global filter to catch all unexpected exceptions
	// TODO: check this together
	app.useGlobalFilters(new AllExceptionsFilter());

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
	app.use('/images', express.static('images'));
	await app.listen(3000, '0.0.0.0').catch((error) => {
		console.error('Error starting the application:', error);
	});
}
bootstrap();
