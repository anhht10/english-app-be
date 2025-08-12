import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from '@/modules/notes/schemas/note.schema';
import { UsersModule } from '@/modules/users/users.module';
import { SlugCounterModule } from '@/modules/slug-counter/slug-counter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Note.name,
        schema: NoteSchema,
      },
    ]),
    UsersModule,
    SlugCounterModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
