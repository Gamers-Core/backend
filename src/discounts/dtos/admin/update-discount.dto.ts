import { PartialType } from 'src/common/partial-type';

import { CreateDiscountDTO } from './create-discount.dto';

export class UpdateDiscountDTO extends PartialType(CreateDiscountDTO) {}
