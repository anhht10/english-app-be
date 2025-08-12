import { TodoPriority } from '@/modules/todos/enum/enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsOptional()
  thumbnail: string;

  @IsOptional()
  @IsHexColor({ message: 'Background color must be a valid hex color' })
  bgColor: string;

  @IsOptional()
  @IsEnum(TodoPriority, {
    message: `Priority must be a valid ${Object.values(TodoPriority).join(', ')} value`,
  })
  priority: TodoPriority;

  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: Date;

  @IsOptional()
  @IsBoolean({ message: 'Pinned must be a boolean' })
  pinned: boolean;

  @IsArray({ message: 'Tags must be an array of strings' })
  @IsOptional()
  @IsString({ each: true, message: 'Each tag must be a string' })
  @Type(() => String)
  tags: string[];
}
