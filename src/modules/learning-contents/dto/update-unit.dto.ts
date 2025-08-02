import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Optional } from '@nestjs/common';

export class UpdateUnitDto {
  @IsOptional()
  title: string;

  @IsArray({ message: 'Images must be an array of strings' })
  @IsOptional()
  @IsString({ each: true })
  @Type(() => String)
  images: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;

  @IsOptional()
  @IsBoolean({ message: 'IsLast must be a boolean' })
  isLast: boolean;

  @IsOptional()
  @IsMongoId({ message: 'Chapter ID must be a valid MongoDB ObjectId' })
  chapter: string;
}
