import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { ActivateUserDto } from '@/modules/auth/dto/update-auth.dto';

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  avatar?: string;
}

export class UpdateUserActiveDto {
  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  code: string;
}

export class ResetPasswordWithOtpDto {
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsNotEmpty({ message: 'The code cannot be empty' })
  @Length(6, 6, { message: 'The code must be 6 characters long' })
  code: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
  })
  newPassword: string;
}

export class SendCodeDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsNotEmpty()
  type: string;
}
