import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma-service/prisma.service';

@Injectable()
export class DatabaseSetupService implements OnModuleInit {
	constructor(private readonly prisma: PrismaService) {}

	async onModuleInit() {
		await this.seedDatabase();
	}

	async seedDatabase() {
		try {
			const userCount = await this.prisma.user.count();
			if (userCount === 0) {
				console.log('Populating database with default profiles...');
				try {
					await this.prisma.user.createMany({
						data: [
							{
								login: 'sosophie',
								email: 'sophie@42.fr',
								image: 'sophie.jpg',
								isDefaultProfile: true,
							},
							{
								login: 'freexav',
								email: 'xavier@42.fr',
								image: 'xavier.jpg',
								isDefaultProfile: true,
							},
							{
								login: 'chucky75',
								email: 'chucky@murderdolls.fr',
								image: 'chucky.jpg',
								isDefaultProfile: true,
							},
							{
								login: 'm3gan',
								email: 'm3g@n.droid',
								image: 'm3gan.jpg',
								isDefaultProfile: true,
							},
							{
								login: 't1t1bon',
								email: 'tintin@bon.fr',
								image: 'emmanuel.jpg',
								isDefaultProfile: true,
							},
							{
								login: 'norminet',
								email: 'norminet@42.fr',
								image: 'norminet.jpg',
								isDefaultProfile: true,
							},
						],
					});
					await this.prisma.chat.createMany({
						data: [
							{ isChannel: false, isPrivate: false, isProtected: false },
							{ isChannel: false, isPrivate: false, isProtected: false },
							{ isChannel: false, isPrivate: false, isProtected: false },
						],
					});
					await this.prisma.chatSession.createMany({
						data: [
							{ userId: 1, chatId: 1 },
							{ userId: 2, chatId: 1 },
							{ userId: 2, chatId: 2 },
							{ userId: 6, chatId: 3 },
						],
					});
					await this.prisma.message.createMany({
						data: [
							{ content: 'Miaou ?', userId: 6 },
							{ content: 'This is Sophie here', userId: 1 },
							{ content: "Tu changes quand d'opérateur ?", userId: 2 },
						],
					});
				} catch (error) {
					throw new Error('Error populating database: ' + error);
				}
			} else {
				console.log('Database was not empty, not populating it !');
			}
		} catch (error) {}
	}
}
