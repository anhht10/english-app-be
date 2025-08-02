import { CreateChapterDto } from '@/modules/learning-contents/dto/create-chapter.dto';
import { UpdateChapterDto } from '@/modules/learning-contents/dto/update-chapter.dto';
import { Chapter } from '@/modules/learning-contents/schemas/chapter.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ChaptersService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
  ) {}

  async create(createChapterDto: CreateChapterDto) {
    const chapter = await this.chapterModel.create(createChapterDto);
    return {
      _id: chapter._id,
    };
  }

  findAll() {
    return `This action returns all chapters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chapter`;
  }

  async findByOrder(order: number) {
    const chapter = await this.chapterModel
      .findOne({ order })
      .populate({
        path: 'units',
        select: '-__v -createdAt -updatedAt',
        populate: {
          path: 'lessons',
          select: '-__v -createdAt -updatedAt',
        },
      })
      .lean();
    return chapter;
  }

  update(id: number, updateChapterDto: UpdateChapterDto) {
    return this.chapterModel.updateOne({ _id: id }, { updateChapterDto });
  }

  remove(id: number) {
    return `This action removes a #${id} chapter`;
  }

  async exists(condition: FilterQuery<Chapter>): Promise<boolean> {
    const chapter = await this.chapterModel.exists(condition);
    return !!chapter;
  }
}
