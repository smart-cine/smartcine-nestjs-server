import { Test, TestingModule } from '@nestjs/testing';
import { CinemaProviderController } from './cinema-provider.controller';

describe('CinemaProviderController', () => {
  let controller: CinemaProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemaProviderController],
    }).compile();

    controller = module.get<CinemaProviderController>(CinemaProviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
