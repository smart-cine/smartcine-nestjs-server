import { Test, TestingModule } from '@nestjs/testing';
import { PickseatService } from './pickseat.service';

describe('PickseatService', () => {
  let service: PickseatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PickseatService],
    }).compile();

    service = module.get<PickseatService>(PickseatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
