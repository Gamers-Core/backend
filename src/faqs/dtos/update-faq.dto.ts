import { PartialType } from 'src/common/partial-type';

import { AddFAQDTO } from './add-faq.dto';

export class UpdateFAQDTO extends PartialType(AddFAQDTO) {}
