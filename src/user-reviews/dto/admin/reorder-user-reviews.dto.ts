import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';

export class ReorderUserReviewsDTO {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @ArrayMaxSize(3)
  @ArrayMinSize(3)
  ids: number[];
}
