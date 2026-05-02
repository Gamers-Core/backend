import { Controller, Get } from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { Serialize } from 'src/interceptors/serialize.interceptor';

import { UserReviewDTO } from '../dto/user/user-review.dto';
import { UserReviewsService } from '../user-reviews.service';

@Controller('user-reviews')
@Serialize(UserReviewDTO)
@Public()
export class UserReviewsController {
  constructor(private readonly userReviewsService: UserReviewsService) {}

  @Get()
  getAll() {
    return this.userReviewsService.getAll();
  }
}
