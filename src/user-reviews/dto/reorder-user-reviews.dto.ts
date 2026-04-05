import { IsArray, IsInt, Max, Min } from 'class-validator';

export class ReorderUserReviewsDTO {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(3)
  ids: number[];
}
