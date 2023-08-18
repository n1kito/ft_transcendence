import { Test, TestingModule } from '@nestjs/testing';
import { AuthCheckService } from './auth-check.service';

describe('AuthCheckService', () => {
  let service: AuthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthCheckService],
    }).compile();

    service = module.get<AuthCheckService>(AuthCheckService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
