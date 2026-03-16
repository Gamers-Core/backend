import { IsString, MinLength } from 'class-validator';

import { ProductSharedFieldsDTO } from './product-shared-fields.dto';

export class CreateProductDTO extends ProductSharedFieldsDTO {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @MinLength(5)
  description: string;
}
