import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: Number })
  order: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLast: boolean;

  @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: 'Unit' })
  unit: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
