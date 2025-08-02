import { Test, TestingModule } from '@nestjs/testing';
import { UnitsService } from './units.service';
import { ChaptersService } from '@/modules/learning-contents/services/chapters.service';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Unit } from '@/modules/learning-contents/schemas/unit.schema';

describe('UnitsService', () => {
  let service: UnitsService;
  let unitModelMock: any;
  let chaptersService: Partial<ChaptersService>;

  let mockUnit = {
    _id: 'unit-id',
    title: 'Unit Title',
    images: ['image1.png', 'image2.png'],
    order: 1,
    isLast: false,
    chapter: 'chapter-id',
  };

  beforeEach(async () => {
    unitModelMock = {
      create: jest.fn().mockImplementation((dto) => {
        return Promise.resolve({
          ...dto,
          _id: 'new-unit-id',
        });
      }),
      updateOne: jest
        .fn()
        .mockResolvedValue({ acknowledged: true, modifiedCount: 1 }),
      exists: jest.fn().mockImplementation(async (condition) => {
        const hasValueContainingNon = Object.values(condition).some(
          (value) => typeof value === 'string' && value.includes('non'),
        );
        return !hasValueContainingNon;
      }),
    };

    chaptersService = {
      exists: jest.fn().mockImplementation(async (condition: any) => {
        const hasValueContainingNon = Object.values(condition).some(
          (value) => typeof value === 'string' && value.includes('non'),
        );

        return !hasValueContainingNon;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        { provide: ChaptersService, useValue: chaptersService },
        { provide: getModelToken(Unit.name), useValue: unitModelMock },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundExeption if chapter does not exist', async () => {
      const dto = {
        ...mockUnit,
        chapter: 'non-existing-chapter-id',
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should create a new unit', async () => {
      const dto = mockUnit;

      const result = await service.create(dto);
      expect(result).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
        }),
      );
      expect(chaptersService.exists).toHaveBeenCalledWith({ _id: dto.chapter });
      expect(unitModelMock.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if chapter does not exist', async () => {
      const dto = {
        ...mockUnit,
        chapter: 'non-existing-chapter-id',
      };

      await expect(service.update('unit-id', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update an existing unit', async () => {
      const dto = {
        ...mockUnit,
        title: 'Updated Unit Title',
      };

      const result = await service.update('unit-id', dto);
      expect(result).toEqual({
        acknowledged: true,
        modifiedCount: 1,
      });
      expect(unitModelMock.updateOne).toHaveBeenCalledWith(
        { _id: 'unit-id' },
        dto,
      );
    });
  });
});
