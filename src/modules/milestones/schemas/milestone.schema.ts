import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Milestone {
  @Prop({ required: true, type: String })
  chapterId: string;

  @Prop({ required: false, type: String })
  unitId: string;

  @Prop({ required: false, type: String })
  lessonId: string;

  @Prop({ required: false, type: String })
  exerciseId: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Milestone' }], default: null })
  subMilestones: Types.ObjectId[];
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
