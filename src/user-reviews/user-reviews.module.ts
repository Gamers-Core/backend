import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MediaModule } from 'src/media/media.module';

import { AdminUserReviewsController } from './admin-user-reviews.controller';
import { UserReview } from './entities/user-review.entity';
import { UserReviewsController } from './user-reviews.controller';
import { UserReviewsService } from './user-reviews.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserReview]), MediaModule],
  controllers: [UserReviewsController, AdminUserReviewsController],
  providers: [UserReviewsService],
})
export class UserReviewsModule {}
