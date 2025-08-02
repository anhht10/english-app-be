import { UserCodeType, UserRole } from '@/common/enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

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
    type: mongoose.Schema.ObjectId,
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

  @Prop({
    type: {
      code: String,
      exp: Date,
      isUsed: { type: Boolean, default: false },
      type: {
        type: String,
        enum: UserCodeType,
        default: UserCodeType.ACTIVATION,
      },
    },
  })
  code: {
    code: String;
    exp: Date;
    isUsed: boolean;
    type: UserCodeType;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
