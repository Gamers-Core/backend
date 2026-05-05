import { PartialType } from 'src/common/partial-type';

import { AddBrandDTO } from './add-brand.dto';

export class UpdateBrandDTO extends PartialType(AddBrandDTO) {}
