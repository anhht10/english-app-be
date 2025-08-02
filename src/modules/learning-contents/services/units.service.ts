import { CreateUnitDto } from '@/modules/learning-contents/dto/create-unit.dto';
import { UpdateUnitDto } from '@/modules/learning-contents/dto/update-unit.dto';
import { Unit } from '@/modules/learning-contents/schemas/unit.schema';
import { ChaptersService } from '@/modules/learning-contents/services/chapters.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class UnitsService {
  constructor(
    @InjectModel(Unit.name) private unitModel: Model<Unit>,
    private readonly chaptersService: ChaptersService,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    const { chapter } = createUnitDto;
    const existChapter = await this.chaptersService.exists({ _id: chapter });
    console.log('existChapter', existChapter);
    if (!existChapter) {
      throw new NotFoundException(`Chapter with ID ${chapter} does not exist`);
    }
    const newUnit = await this.unitModel.create(createUnitDto);
    return {
      _id: newUnit._id,
    };
  }

  findAll() {
    return `This action returns all units`;
  }

  findOne(id: number) {
    return `This action returns a #${id} unit`;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    const { chapter } = updateUnitDto;

    if (!!chapter) {
      const existChapter = await this.chaptersService.exists({ _id: chapter });
      if (!existChapter) {
        throw new NotFoundException(
          `Chapter with ID ${chapter} does not exist`,
        );
      }
    }
    const updatedUnit = await this.unitModel.updateOne(
      { _id: id },
      updateUnitDto,
    );

    return updatedUnit;
  }

  remove(id: number) {
    return `This action removes a #${id} unit`;
  }

  async exists(condition: FilterQuery<Unit>): Promise<boolean> {
    const unit = await this.unitModel.exists(condition);
    return !!unit;
  }
}
