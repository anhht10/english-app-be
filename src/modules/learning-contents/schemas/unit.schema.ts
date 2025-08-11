import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Unit {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ required: true, type: Number })
  order: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLast: boolean;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'Chapter' })
  chapter: Types.ObjectId;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);

UnitSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'unit',
});

UnitSchema.index({ chapter: 1, order: 1 }, { unique: true });

UnitSchema.set('toObject', { virtuals: true });
UnitSchema.set('toJSON', { virtuals: true });
