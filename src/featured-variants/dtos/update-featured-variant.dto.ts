import { PartialType } from 'src/common';

import { AddFeaturedVariantDTO } from './add-featured-variant.dto';

export class UpdateFeaturedVariantDTO extends PartialType(AddFeaturedVariantDTO) {}
