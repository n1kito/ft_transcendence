import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseSetupService } from './database-setup.service';

describe('DatabaseSetupService', () => {
	let service: DatabaseSetupService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [DatabaseSetupService],
		}).compile();

		service = module.get<DatabaseSetupService>(DatabaseSetupService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
