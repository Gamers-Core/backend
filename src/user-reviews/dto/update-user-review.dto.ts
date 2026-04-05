import { PartialType } from 'src/common';

import { AddUserReviewDTO } from './add-user-review.dto';

export class UpdateUserReviewDTO extends PartialType(AddUserReviewDTO) {}
