import { TodoPriority, TodoStatus } from '@/modules/todos/enum/enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Todo {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String })
  thumbnail: string;

  @Prop({ type: String })
  bgColor: String;

  @Prop({
    type: String,
    enum: TodoStatus,
    required: true,
    default: TodoStatus.PENDING,
  })
  status: TodoStatus;

  @Prop({
    type: String,
    enum: TodoPriority,
    required: true,
    default: TodoPriority.LOW,
  })
  priority: TodoPriority;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: Boolean })
  pinned: boolean;

  @Prop({ type: [String] })
  tags: string[];
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
