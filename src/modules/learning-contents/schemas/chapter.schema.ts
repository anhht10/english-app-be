import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chapter {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: String })
  image: string;

  @Prop({ required: true, type: Number, unique: true })
  order: number;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

ChapterSchema.virtual('units', {
  ref: 'Unit',
  localField: '_id',
  foreignField: 'chapter',
});

ChapterSchema.set('toObject', { virtuals: true });
ChapterSchema.set('toJSON', { virtuals: true });
