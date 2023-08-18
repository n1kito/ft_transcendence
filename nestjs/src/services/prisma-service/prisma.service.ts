import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnApplicationShutdown
{
	constructor() {
		super(); // calls the constructor of super class 'PrismaClient'
	}

	async connectToDatabase() {
		await this.$connect(); // establish a connection to the database
	}

	async onApplicationShutdown() {
		await this.$disconnect(); // close the database connection
	}

	async findUserById(userId: number) {
		return this.user.findUnique({
			where: { id: userId },
		});
	}
}
