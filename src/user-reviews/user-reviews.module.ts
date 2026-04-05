import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserReview } from 'src/entity';
import { MediaModule } from 'src/media';

import { UserReviewsController } from './user-reviews.controller';
import { UserReviewsService } from './user-reviews.service';
import { AdminUserReviewsController } from './admin-user-reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserReview]), MediaModule],
  controllers: [UserReviewsController, AdminUserReviewsController],
  providers: [UserReviewsService],
})
export class UserReviewsModule {}
