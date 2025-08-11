import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateLessonDto } from '../dto/update-lesson.dto';
import { CreateLessonDto } from '@/modules/learning-contents/dto/create-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Lesson } from '@/modules/learning-contents/schemas/lesson.schema';
import { Model } from 'mongoose';
import { UnitsService } from '@/modules/learning-contents/services/units.service';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    private readonly unitService: UnitsService,
  ) {}

  async create(createLessonDto: CreateLessonDto) {
    const { unit } = createLessonDto;
    const existUnit = await this.unitService.exists({ _id: unit });

    if (!existUnit) {
      throw new NotFoundException(`Unit with ID ${unit} does not exist`);
    }

    try {
      const newLesson = await this.lessonModel.create(createLessonDto);
      return {
        _id: newLesson._id,
      };
    } catch (error) {
      if (error?.code === 11000 && error?.keyValue) {
        const keys = Object.keys(error.keyValue).join(', ');
        throw new ConflictException(
          `Duplicate value for unique fields: ${keys}`,
        );
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all lessons`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const { unit } = updateLessonDto;

    if (!!unit) {
      const existUnit = await this.unitService.exists({ _id: unit });
      if (!existUnit) {
        throw new NotFoundException(`Unit with ID ${unit} does not exist`);
      }
    }

    try {
      const updatedLesson = await this.lessonModel.updateOne(
        { _id: id },
        updateLessonDto,
      );

      return updatedLesson;
    } catch (error) {
      if (error.code === 11000) {
        const keys = Object.keys(error.keyValue).join(', ');
        throw new ConflictException(
          `Duplicate value for unique fields: ${keys}`,
        );
      }
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
