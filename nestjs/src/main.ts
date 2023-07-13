import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
// import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

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
	await app.listen(3000);
}
bootstrap();
