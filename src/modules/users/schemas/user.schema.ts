import { UserRole } from '@/common/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: false, type: String, default: null })
  phone: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: false, type: String, default: null })
  avatar: string;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: 'Milestone',
    default: null,
  })
  milestoneId: Types.ObjectId;

  @Prop({
    required: false,
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: Boolean,
    default: false,
  })
  isActive: boolean;

  @Prop()
  code: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isCodeUsed: boolean;

  @Prop()
  codeExp: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
