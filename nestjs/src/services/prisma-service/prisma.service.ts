import { Injectable, OnApplicationShutdown, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnApplicationShutdown, OnApplicationBootstrap {
  constructor() {
    super(); // calls the constructor of the super class 'PrismaClient'
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
