import { IsArray, IsInt, Min } from 'class-validator';

export class ReorderVariantsDTO {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}
