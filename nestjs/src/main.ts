import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
// import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as cookieParser from 'cookie-parser';

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
		origin: 'http://localhost:3001',
	});
	app.use(cookieParser());
	await app.listen(3000);
}
bootstrap();
