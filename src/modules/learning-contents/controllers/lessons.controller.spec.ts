import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from '../services/lessons.service';
import { LessonsController } from '@/modules/learning-contents/controllers/lessons.controller';

describe('LessonsController', () => {
  let controller: LessonsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonsController],
      providers: [LessonsService],
    }).compile();

    controller = module.get<LessonsController>(LessonsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
