import { Test, TestingModule } from '@nestjs/testing';
import { CinemaRoomService } from './cinema-room.service';

describe('CinemaRoomService', () => {
  let service: CinemaRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CinemaRoomService],
    }).compile();

    service = module.get<CinemaRoomService>(CinemaRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
