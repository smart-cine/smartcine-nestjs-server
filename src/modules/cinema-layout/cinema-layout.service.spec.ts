import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutService } from './cinema-layout.service';

describe('CinemaLayoutService', () => {
  let service: CinemaLayoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CinemaLayoutService],
    }).compile();

    service = module.get<CinemaLayoutService>(CinemaLayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
