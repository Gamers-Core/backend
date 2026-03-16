import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

import { mediaStatuses, mediaTypes } from 'src/entity';
import type { MediaStatus, MediaType } from 'src/entity';

export class CreateMediaDTO {
  @IsUrl()
  url: string;

  @IsString()
  publicId: string;

  @IsIn(mediaTypes)
  type: MediaType;

  @IsOptional()
  @IsIn(mediaStatuses)
  status?: MediaStatus;

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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;
}
