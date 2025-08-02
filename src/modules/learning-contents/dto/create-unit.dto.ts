import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsArray({ message: 'Images must be an array of strings' })
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  images: string[];

  @IsNotEmpty({ message: 'Order is required' })
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;

  @IsOptional()
  @IsBoolean({ message: 'IsLast must be a boolean' })
  isLast: boolean;

  @IsNotEmpty({ message: 'Chapter ID is required' })
  @IsMongoId({ message: 'Chapter ID must be a valid MongoDB ObjectId' })
  chapter: string;
}
