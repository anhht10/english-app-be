import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Request() { user: { _id: reqId } },
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.notesService.create(reqId, createNoteDto);
  }

  @Get()
  findAll(
    @Request() { user: { _id: reqId, role } },
    @Query() { limit = 10, page = 1, search = '', ...query },
  ) {
    // if (role === UserRole.ADMIN) {
    //   return this.notesService.findAll(query, limit, page, search);
    // } else {
    query.user = reqId;
    return this.notesService.findAll(query, limit, page, search);
    // }
  }

  @Get(':slug')
  findOne(
    @Request() { user: { _id: reqId, role } },
    @Param('slug') slug: string,
  ) {
    return this.notesService.findOne(reqId, slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.update(id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notesService.remove(id);
  }
}
