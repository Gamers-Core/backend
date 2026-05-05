import { PartialType } from 'src/common/partial-type';

import { CreateVariantDTO } from './create-variant.dto';

export class UpdateVariantDTO extends PartialType(CreateVariantDTO) {}
