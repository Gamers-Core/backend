import { PartialType } from 'src/common/partial-type';

import { AddUserReviewDTO } from './add-user-review.dto';

export class UpdateUserReviewDTO extends PartialType(AddUserReviewDTO) {}
