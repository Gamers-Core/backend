import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/services/media.service';

import { AddUserReviewDTO } from './dto/admin/add-user-review.dto';
import { UpdateUserReviewDTO } from './dto/admin/update-user-review.dto';
import { UserReview } from './entities/user-review.entity';

@Injectable()
export class UserReviewsService {
  constructor(
    @InjectRepository(UserReview)
    private readonly repo: Repository<UserReview>,
    private readonly mediaService: MediaService,
  ) {}

  getAll() {
    return this.getAllOrdered();
  }

  add({ imageId, ...dto }: AddUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const count = await repo.count();
      if (count >= 3) throw BadRequestException('userReviews.maxCount');

      const image = await this.mediaService.attach(imageId, manager);
      await repo.save(repo.create({ ...dto, position: count + 1, image }));

      return this.getAllOrdered(manager);
    });
  }

  update(position: number, { imageId, ...dto }: UpdateUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const review = await repo.findOne({ where: { position } });
      if (!review) throw NotFoundException('userReviews.notFound');

      Object.assign(review, dto);

      if (imageId) review.image = await this.mediaService.swapImage(imageId, review.image?.id, manager);

      await repo.save(review);

      return this.getAllOrdered(manager);
    });
  }

  reorder(ids: number[]) {
    return this.repo.manager.transaction(async (manager) => {
      const reviews = await this.getAllOrdered(manager);

      const uniqueIds = new Set(ids);
      if (reviews.length !== uniqueIds.size) throw BadRequestException('userReviews.invalidIds');

      const reviewById = new Map(reviews.map((review) => [review.id, review]));
      if (ids.some((id) => !reviewById.has(id))) throw BadRequestException('userReviews.invalidIds');

      const ordered = ids.map((id) => reviewById.get(id)!);
      await this.reorderInternal(ordered, manager);

      return this.getAllOrdered(manager);
    });
  }

  remove(position: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const result = await repo.delete({ position });
      if (!result.affected) throw NotFoundException('userReviews.notFound');

      const remaining = await this.getAllOrdered(manager);
      await this.reorderInternal(remaining, manager);

      return this.getAllOrdered(manager);
    });
  }

  private async reorderInternal(reviews: UserReview[], manager: EntityManager) {
    const repo = manager.getRepository(UserReview);
    if (!reviews.length) return;

    await repo.save(reviews.map((review, i) => ({ ...review, position: -(i + 1) })));
    await repo.save(reviews.map((review, i) => ({ ...review, position: i + 1 })));
  }

  private getAllOrdered(manager?: EntityManager) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(UserReview);

      return repo.find({
        order: { position: 'ASC' },
        relations: { image: true },
      });
    });
  }
}
