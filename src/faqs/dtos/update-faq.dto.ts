import { PartialType } from 'src/common';

import { AddFAQDTO } from './add-faq.dto';

export class UpdateFAQDTO extends PartialType(AddFAQDTO) {}
