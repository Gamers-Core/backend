import { PartialType } from 'src/common';

import { CreateProductDTO } from './create-product.dto';

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}
