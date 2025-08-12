import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Note } from '@/modules/notes/schemas/note.schema';
import { Model } from 'mongoose';
import { UsersService } from '@/modules/users/users.service';
import aqp from 'api-query-params';
import { SlugCounterService } from '@/modules/slug-counter/slug-counter.service';
import { v4 } from 'uuid';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
    private readonly usersService: UsersService,
    private readonly slugService: SlugCounterService,
  ) {}

  async create(user: string, createNoteDto: CreateNoteDto) {
    const existUser = await this.usersService.exists({ _id: user });

    const { title } = createNoteDto;

    if (!existUser) {
      throw new NotFoundException(`User with ID ${user} does not exist`);
    }

    let slug = v4();
    if (title) {
      slug = await this.slugService.generateSlug(Note.name, title);
    }

    const note = await this.noteModel.create({ user, ...createNoteDto, slug });

    return {
      _id: note._id,
    };
  }

  async findAll(query: any, limit: number, page: number, search: string) {
    const { filter, sort, projection } = aqp(query);

    if (!page || isNaN(page)) {
      page = 1;
    }

    if (!limit || isNaN(limit)) {
      limit = 10;
    }

    const notes = await this.noteModel
      .find({
        ...filter,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      })
      .select(projection ?? '-__v')
      .sort(sort as any)
      .limit(limit)
      .skip((page - 1) * limit);

    return notes;
  }

  async findOne(reqId: string, slug: string) {
    const note = await this.noteModel.findOne({ slug, user: reqId });
    if (!note) {
      throw new NotFoundException(`Note with slug ${slug} not found`);
    }
    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto) {
    const udt: any = updateNoteDto;
    if (updateNoteDto.title) {
      const slug = await this.slugService.generateSlug(
        Note.name,
        updateNoteDto.title,
      );
      udt.slug = slug;
    }
    const update = await this.noteModel.updateOne({ _id: id }, udt);
    return update;
  }

  async remove(id: string) {
    const result = await this.noteModel.deleteOne({ _id: id });
    return { deleted: result.deletedCount > 0 };
  }
}
