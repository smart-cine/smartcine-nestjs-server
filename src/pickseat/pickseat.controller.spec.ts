import { Test, TestingModule } from '@nestjs/testing';
import { PickseatController } from './pickseat.controller';

describe('PickseatController', () => {
  let controller: PickseatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickseatController],
    }).compile();

    controller = module.get<PickseatController>(PickseatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
