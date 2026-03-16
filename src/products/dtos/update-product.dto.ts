import { IsOptional, IsString, MinLength } from 'class-validator';

import { ProductSharedFieldsDTO } from './product-shared-fields.dto';

export class UpdateProductDTO extends ProductSharedFieldsDTO {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  description?: string;
}
