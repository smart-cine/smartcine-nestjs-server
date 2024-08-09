import { Test, TestingModule } from '@nestjs/testing';
import { CinemaLayoutGroupController } from './cinema-layout-group.controller';

describe('CinemaLayoutGroupController', () => {
  let controller: CinemaLayoutGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemaLayoutGroupController],
    }).compile();

    controller = module.get<CinemaLayoutGroupController>(CinemaLayoutGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
