import { PartialType } from 'src/common/partial-type';

import { AddFeaturedVariantDTO } from './add-featured-variant.dto';

export class UpdateFeaturedVariantDTO extends PartialType(AddFeaturedVariantDTO) {}
