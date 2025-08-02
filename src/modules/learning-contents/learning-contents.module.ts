import { ChaptersController } from '@/modules/learning-contents/controllers/chapters.controller';
import { LessonsController } from '@/modules/learning-contents/controllers/lessons.controller';
import { UnitsController } from '@/modules/learning-contents/controllers/units.controller';
import {
  Chapter,
  ChapterSchema,
} from '@/modules/learning-contents/schemas/chapter.schema';
import {
  Lesson,
  LessonSchema,
} from '@/modules/learning-contents/schemas/lesson.schema';
import {
  Unit,
  UnitSchema,
} from '@/modules/learning-contents/schemas/unit.schema';
import { ChaptersService } from '@/modules/learning-contents/services/chapters.service';
import { LessonsService } from '@/modules/learning-contents/services/lessons.service';
import { UnitsService } from '@/modules/learning-contents/services/units.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chapter.name,
        schema: ChapterSchema,
      },
      {
        name: Unit.name,
        schema: UnitSchema,
      },
      {
        name: Lesson.name,
        schema: LessonSchema,
      },
    ]),
  ],
  controllers: [ChaptersController, UnitsController, LessonsController],
  providers: [ChaptersService, UnitsService, LessonsService],
})
export class LearningContentsModule {}
