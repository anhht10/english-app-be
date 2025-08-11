import { Public } from '@/common/decorator/customize';
import { CreateChapterDto } from '@/modules/learning-contents/dto/create-chapter.dto';
import { UpdateChapterDto } from '@/modules/learning-contents/dto/update-chapter.dto';
import { ChaptersService } from '@/modules/learning-contents/services/chapters.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  findAll() {
    return this.chaptersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(+id);
  }

  @Get('order/:order')
  findByOrder(@Param('order') order: number) {
    return this.chaptersService.findByOrder(order);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(+id, updateChapterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(+id);
  }
}
