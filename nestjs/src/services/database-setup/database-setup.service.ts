import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma.service';

@Injectable()
export class DatabaseSetupService implements OnModuleInit {
	constructor(private readonly prisma: PrismaService) {}

	async onModuleInit() {
		await this.seedDatabase();
	}

	async seedDatabase() {
		const userCount = await this.prisma.user.count();
		// TODO: they will also need to have detault friends
		if (userCount === 0) {
			console.log('Populating database with default profiles...');
			await this.prisma.user.createMany({
				data: [
					{
						login: 'sosophie',
						email: 'sophie@42.fr',
						image: '/images/sophie.jpg',
						isDefaultProfile: true,
					},
					{
						login: 'freexav',
						email: 'xavier@42.fr',
						image: '/images/xavier.jpg',
						isDefaultProfile: true,
					},
					{
						login: 'chucky75',
						email: 'chucky@murderdolls.fr',
						image: '/images/chucky.jpg',
						isDefaultProfile: true,
					},
					{
						login: 'm3gan',
						email: 'm3g@n.droid',
						image: '/images/m3gan.jpg',
						isDefaultProfile: true,
					},
					{
						login: 't1t1bon',
						email: 'tintin@bon.fr',
						image: '/images/emmanuel.jpg',
						isDefaultProfile: true,
					},
					{
						login: 'norminet',
						email: 'norminet@42.fr',
						image: '/images/norminet.jpg',
						isDefaultProfile: true,
					},
				],
			});
		} else {
			console.log('Database was not empty, not populating it !');
		}
	}
}
