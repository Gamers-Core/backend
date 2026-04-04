import { PartialType } from 'src/common';

import { CreateVariantDTO } from './create-variant.dto';

export class UpdateVariantDTO extends PartialType(CreateVariantDTO) {}
