import { PartialType } from 'src/common';

import { AddBrandDTO } from './add-brand.dto';

export class UpdateBrandDTO extends PartialType(AddBrandDTO) {}
