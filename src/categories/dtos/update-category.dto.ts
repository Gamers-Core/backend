import { PartialType } from 'src/common';

import { AddCategoryDTO } from './add-category.dto';

export class UpdateCategoryDTO extends PartialType(AddCategoryDTO) {}
