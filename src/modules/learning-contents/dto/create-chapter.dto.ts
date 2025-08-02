import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateChapterDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsOptional()
  image: string;

  @IsNotEmpty({ message: 'Order is required' })
  @IsNumber({}, { message: 'Order must be a number' })
  order: number;
}
