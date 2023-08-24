import {
	Injectable,
	OnApplicationShutdown,
	OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnApplicationShutdown, OnApplicationBootstrap
{
	constructor() {
		super(); // calls the constructor of the super class 'PrismaClient'
	}

	async findUserById(userId: number) {
		return this.user.findUnique({
			where: { id: userId },
		});
	}

	async findRandomUserExcept(userId: number) {
		// count how many users there are except our userId
		const totalUsers = await this.user.count({
			where: { NOT: { id: userId } },
		});
		// generate a random number in that range
		const randomUserIndex = Math.floor(Math.random() * totalUsers);
		// retrieve that user from the database
		const randomUser = await this.user.findMany({
			where: { NOT: { id: userId } },
			skip: randomUserIndex,
			take: 1,
		});
		return randomUser[0];
	}

	async onApplicationBootstrap() {
		try {
			await this.$connect();
			console.log('Database connected successfully!');
		} catch (error) {
			console.error('Error connecting to the database:', error);
		}
	}

	async onApplicationShutdown() {
		await this.$disconnect(); // close the database connection
		console.log('Database connection closed.');
	}
}
