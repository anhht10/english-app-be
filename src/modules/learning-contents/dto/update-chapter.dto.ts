import { PartialType } from '@nestjs/mapped-types';
import { CreateChapterDto } from './create-chapter.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateChapterDto {
  @IsOptional()
  title: string;

  @IsOptional()
  image: string;

  @IsOptional()
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;
}
