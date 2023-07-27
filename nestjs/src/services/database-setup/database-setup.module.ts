import { Module } from '@nestjs/common';
import { DatabaseSetupService } from './database-setup.service';
import { PrismaModule } from '../prisma-service/prisma.module';

@Module({
	imports: [PrismaModule],
	providers: [DatabaseSetupService],
})
export class DatabaseSetupModule {}
