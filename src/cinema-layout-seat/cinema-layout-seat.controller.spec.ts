import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutSeatController } from './cinema-layout-seat.controller';

describe('CinemaLayoutSeatController', () => {
  let controller: CinemaLayoutSeatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemaLayoutSeatController],
    }).compile();

    controller = module.get<CinemaLayoutSeatController>(CinemaLayoutSeatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
