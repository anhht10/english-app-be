import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNoteDto {
  @IsOptional()
  title: string;

  @IsOptional()
  content: any;

  @IsOptional()
  thumbnail: string;

  @IsOptional()
  @IsHexColor({ message: 'Background color must be a valid hex color' })
  bgColor: string;

  @IsOptional()
  @IsBoolean({ message: 'Pinned must be a boolean' })
  pinned: boolean;

  @IsArray({ message: 'Tags must be an array of strings' })
  @IsOptional()
  @IsString({ each: true, message: 'Each tag must be a string' })
  @Type(() => String)
  tags: string[];
}
