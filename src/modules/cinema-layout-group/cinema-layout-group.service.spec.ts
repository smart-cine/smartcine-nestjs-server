import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutGroupService } from './cinema-layout-group.service';

describe('CinemaLayoutGroupService', () => {
  let service: CinemaLayoutGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CinemaLayoutGroupService],
    }).compile();

    service = module.get<CinemaLayoutGroupService>(CinemaLayoutGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
