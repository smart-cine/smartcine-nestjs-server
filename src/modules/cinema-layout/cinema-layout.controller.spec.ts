import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutController } from './cinema-layout.controller';

describe('CinemaLayoutController', () => {
  let controller: CinemaLayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemaLayoutController],
    }).compile();

    controller = module.get<CinemaLayoutController>(CinemaLayoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
