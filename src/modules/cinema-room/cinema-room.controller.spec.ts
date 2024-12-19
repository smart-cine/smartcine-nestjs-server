import { Test, TestingModule } from '@nestjs/testing';
import { CinemaRoomController } from './cinema-room.controller';

describe('CinemaRoomController', () => {
  let controller: CinemaRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemaRoomController],
    }).compile();

    controller = module.get<CinemaRoomController>(CinemaRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
