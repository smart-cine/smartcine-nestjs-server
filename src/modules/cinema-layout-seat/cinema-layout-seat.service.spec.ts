import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutSeatService } from './cinema-layout-seat.service';

describe('CinemaLayoutSeatService', () => {
  let service: CinemaLayoutSeatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CinemaLayoutSeatService],
    }).compile();

    service = module.get<CinemaLayoutSeatService>(CinemaLayoutSeatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
