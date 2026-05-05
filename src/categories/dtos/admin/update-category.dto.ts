import { PartialType } from 'src/common/partial-type';

import { AddCategoryDTO } from './add-category.dto';

export class UpdateCategoryDTO extends PartialType(AddCategoryDTO) {}
