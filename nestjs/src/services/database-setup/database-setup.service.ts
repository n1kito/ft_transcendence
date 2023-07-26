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
						firstName: 'Sophie',
						lastName: 'Viger',
						login: 'sosophie',
						email: 'sophie@42.fr',
						image: 'images/sophie.jpg',
					},
					{
						firstName: 'Xavier',
						lastName: 'Niel',
						login: 'freexav',
						email: 'xavier@42.fr',
						image: '/images/xavier.jpg',
					},
					{
						firstName: 'Chucky',
						lastName: 'Doll',
						login: 'chucky75',
						email: 'chucky@murderdolls.fr',
						image: '/images/chucky.jpg',
					},
					{
						firstName: 'm3gan',
						lastName: 'Android',
						login: 'm3gandroid',
						email: 'm3g@n.droid',
						image: '/images/m3gan.jpg',
					},
					{
						firstName: 'Emmanuel',
						lastName: 'Bon',
						login: 't1t1bon',
						email: 'tintin@bon.fr',
						image: '/images/emmanuel.jpg',
					},
					{
						firstName: 'Norminet',
						lastName: '42',
						login: 'norminet',
						email: 'norminet@42.fr',
						image: '/images/norminet.jpg',
					},
				],
			});
		} else {
			console.log('Database was not empty, not populating it !');
		}
	}
}
