import { IsIn, IsInt, IsString, IsUrl, Min } from 'class-validator';

import { mediaTypes } from 'src/entity';
import type { MediaType } from 'src/entity';

export class CreateMediaDTO {
  @IsUrl()
  url: string;

  @IsString()
  publicId: string;

  @IsIn(mediaTypes)
  type: MediaType;

  @IsInt()
  @Min(0)
  width: number;

  @IsInt()
  @Min(0)
  height: number;

  @IsString()
  format: string;

  @IsInt()
  @Min(0)
  bytes: number;
}
