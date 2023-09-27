import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

// Configure dotenv
config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// const corsOptions: CorsOptions = {
	// 	origin: 'http://localhost:3001',
	// 	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	// 	allowedHeaders: 'Content-Type, Accept',
	// 	preflightContinue: false,
	// 	optionsSuccessStatus: 204,
	// };
	app.enableCors({
		origin: ['http://localhost:3001', 'http://localhost:8080'], // Allow requests from this origin
		credentials: true, // Allow credentials (cookies, for us)
	});
	app.use(cookieParser());

	// Setup a global filter to catch all unexpected exceptions
	// app.useGlobalFilters(new AllExceptionsFilter());

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
