import { CreateSlugCounterDto } from '@/modules/slug-counter/dto/create-slug-counter.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateSlugCounterDto extends PartialType(CreateSlugCounterDto) {}
