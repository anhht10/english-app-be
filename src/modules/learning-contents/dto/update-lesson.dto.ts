import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateLessonDto {
  @IsOptional()
  @IsMongoId({ message: 'Unit ID must be a valid MongoDB ObjectId' })
  unit?: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  order?: number;

  @IsOptional()
  isLast?: boolean;
}
