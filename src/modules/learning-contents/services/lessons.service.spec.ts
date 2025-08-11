import { Test, TestingModule } from '@nestjs/testing';
import { LessonsService } from './lessons.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { UnitsService } from '@/modules/learning-contents/services/units.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let mockUnitService: Partial<UnitsService>;

  const mockLesson = {
    _id: 'lesson-id',
    title: 'lesson',
    order: 0,
    isLast: false,
    unit: 'unit-id',
  };

  const mockLessonModel = {
    create: jest.fn().mockImplementation(async (dto) => {
      const exists = Object.values(dto).some(
        (value) =>
          (typeof value === 'string' && value.includes('exist')) ||
          (typeof value === 'number' && value === -1),
      );
      if (exists) {
        throw new ConflictException();
      }
      return mockLesson;
    }),
    exists: jest.fn().mockImplementation(async (f: any) => {
      const exists = Object.values(f).some(
        (value) =>
          (typeof value === 'string' && value.includes('exist')) ||
          (typeof value === 'number' && value === -1),
      );
      return exists;
    }),

    updateOne: jest.fn().mockImplementation(async (_id, dto) => {
      const exists = Object.values(dto).some(
        (value) =>
          (typeof value === 'string' && value.includes('exist')) ||
          (typeof value === 'number' && value === -1),
      );
      if (exists) {
        throw new ConflictException();
      }

      return {
        acknowledged: true,
        modifiedCount: 1,
      };
    }),
  };

  beforeEach(async () => {
    mockUnitService = {
      exists: jest.fn().mockImplementation(async (f: any) => {
        const non_exists = Object.values(f).some(
          (value) =>
            (typeof value === 'string' && value.includes('non')) ||
            (typeof value === 'number' && value === -1),
        );
        return !non_exists;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getModelToken('Lesson'),
          useValue: mockLessonModel,
        },
        {
          provide: UnitsService,
          useValue: mockUnitService,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('it should throw a ConflictException if lesson already exists', async () => {
      const dto = {
        title: mockLesson.title,
        order: -1,
        isLast: mockLesson.isLast,
        unit: 'exist-unit',
      };
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockLessonModel.create).toHaveBeenCalledWith(dto);
    });

    it('it should throw a NotFoundException if unit does not exist', async () => {
      const dto = {
        title: mockLesson.title,
        order: mockLesson.order,
        isLast: mockLesson.isLast,
        unit: 'non-unit',
      };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should create a lesson', async () => {
      const dto = mockLesson;

      const result = await service.create(dto);
      expect(result).toEqual({ _id: mockLesson._id });
      expect(mockLessonModel.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('it should throw a NotFoundException if unit does not exist', async () => {
      const dto = {
        title: 'new',
        order: mockLesson.order,
        isLast: mockLesson.isLast,
        unit: 'non-unit',
      };
      await expect(service.update(mockLesson._id, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a ConflictException if lesson already exists', async () => {
      const dto = {
        title: 'new',
        order: -1,
        isLast: mockLesson.isLast,
        unit: 'exist-unit',
      };

      await expect(service.update(mockLesson._id, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockLessonModel.updateOne).toHaveBeenCalledWith(
        { _id: mockLesson._id },
        dto,
      );
    });

    it('should update a lesson', async () => {
      const dto = {
        title: 'updated-title',
        order: 1,
        isLast: false,
        unit: 'new-unit',
      };
      await expect(service.update(mockLesson._id, dto)).resolves.not.toThrow();
      expect(mockLessonModel.updateOne).toHaveBeenCalledWith(
        { _id: mockLesson._id },
        dto,
      );
    });
  });
});
