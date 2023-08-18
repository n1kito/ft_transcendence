import { Test, TestingModule } from '@nestjs/testing';
import { AuthCheckController } from './auth-check.controller';
import { AuthCheckService } from './auth-check.service';

describe('AuthCheckController', () => {
  let controller: AuthCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthCheckController],
      providers: [AuthCheckService],
    }).compile();

    controller = module.get<AuthCheckController>(AuthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
