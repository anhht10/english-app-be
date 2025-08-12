import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String, unique: true })
  slug: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  content: any;

  @Prop({ type: String })
  thumbnail: string;

  @Prop({ type: String })
  bgColor: String;

  @Prop({ type: Boolean })
  pinned: boolean;

  @Prop({ type: [String] })
  tags: string[];
}

export const NoteSchema = SchemaFactory.createForClass(Note);
