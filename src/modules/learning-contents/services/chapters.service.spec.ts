import { Test, TestingModule } from '@nestjs/testing';
import { ChaptersService } from './chapters.service';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';

describe('ChaptersService', () => {
  let service: ChaptersService;

  const mockChapter = {
    _id: 'chapter-id',
    title: 'chapter',
    image: 'image.jpg',
    order: 0,
  };

  const mockChapterModel = {
    create: jest.fn().mockResolvedValue(mockChapter),
    exists: jest.fn().mockImplementation(async (f: any) => {
      const exists = Object.values(f).some(
        (value) =>
          (typeof value === 'string' && value.includes('exist')) ||
          (typeof value === 'number' && value === -1),
      );
      return exists;
    }),

    findOne: jest.fn().mockResolvedValue(mockChapter),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChaptersService,
        {
          provide: getModelToken('Chapter'),
          useValue: mockChapterModel,
        },
      ],
    }).compile();

    service = module.get<ChaptersService>(ChaptersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createChapter', () => {
    it('it should create a chapter and return an _id', async () => {
      const dto = {
        title: mockChapter.title,
        image: mockChapter.image,
        order: mockChapter.order,
      };
      const result = await service.create(dto);
      expect(result).toEqual({
        _id: mockChapter._id,
      });
      expect(mockChapterModel.create).toHaveBeenCalledWith(dto);
    });

    it('it should throw an BadRequestException if order already exists', async () => {
      const dto = {
        title: mockChapter.title,
        image: mockChapter.image,
        order: -1,
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByOrder', () => {
    it('should return a chapter by order', async () => {
      mockChapterModel.findOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockChapter),
        }),
      });

      const chapter = await service.findByOrder(mockChapter.order);

      expect(chapter).toEqual(
        expect.objectContaining({
          _id: mockChapter._id,
          title: mockChapter.title,
          image: mockChapter.image,
          order: mockChapter.order,
        }),
      );
    });
  });
});
