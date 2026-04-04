import { IsArray, IsInt, Min } from 'class-validator';

export class ReorderFeaturedVariantsDTO {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  orderedIds: number[];
}
