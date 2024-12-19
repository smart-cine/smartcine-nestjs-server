import { Test, TestingModule } from '@nestjs/testing';
import { CinemaProviderService } from './cinema-provider.service';

describe('CinemaProviderService', () => {
  let service: CinemaProviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CinemaProviderService],
    }).compile();

    service = module.get<CinemaProviderService>(CinemaProviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
