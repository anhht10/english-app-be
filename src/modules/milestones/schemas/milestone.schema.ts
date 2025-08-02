import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Milestone {
  @Prop({ required: true, type: String })
  chapter: string;

  @Prop({ required: false, type: String })
  unit: string;

  @Prop({ required: false, type: String })
  lesson: string;

  @Prop({ required: false, type: String })
  exercise: string;

  @Prop({
    type: [{ type: mongoose.Schema.ObjectId, ref: 'Milestone' }],
    default: null,
  })
  subMilestones: Types.ObjectId[];
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
