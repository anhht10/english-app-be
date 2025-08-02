import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Unit ID is required' })
  @IsMongoId({ message: 'Unit ID must be a valid MongoDB ObjectId' })
  unit: string;

  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Order is required' })
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;

  @IsOptional()
  @IsBoolean({ message: 'IsLast must be a boolean' })
  isLast?: boolean;
}
