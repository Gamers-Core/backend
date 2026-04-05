import { Controller, Get } from '@nestjs/common';

import { Serialize } from 'src/interceptors';

import { UserReviewDTO } from './dto';
import { UserReviewsService } from './user-reviews.service';

@Controller('user-reviews')
@Serialize(UserReviewDTO)
export class UserReviewsController {
  constructor(private readonly userReviewsService: UserReviewsService) {}

  @Get()
  getAll() {
    return this.userReviewsService.getAll();
  }
}
