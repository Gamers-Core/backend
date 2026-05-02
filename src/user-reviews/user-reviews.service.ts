import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/media.service';

import { AddUserReviewDTO } from './dto/add-user-review.dto';
import { UpdateUserReviewDTO } from './dto/update-user-review.dto';
import { UserReview } from './entities/user-review.entity';

@Injectable()
export class UserReviewsService {
  constructor(
    @InjectRepository(UserReview)
    private readonly repo: Repository<UserReview>,
    private readonly mediaService: MediaService,
  ) {}

  getAll() {
    return this.findAllWithRelations();
  }

  async add({ imageId, ...dto }: AddUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const count = await repo.count();
      if (count >= 3) throw new BadRequestException('userReviews.maxCount');

      const image = await this.mediaService.attach(imageId, manager);
      await repo.save(repo.create({ ...dto, position: count + 1, image }));

      return this.findAllWithRelations(manager);
    });
  }

  async update(position: number, { imageId, ...dto }: UpdateUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const review = await repo.findOne({ where: { position } });
      if (!review) throw new NotFoundException('userReviews.notFound');

      Object.assign(review, dto);

      if (imageId) review.image = await this.mediaService.swapImage(imageId, review.image?.id, manager);

      await repo.save(review);

      return this.findAllWithRelations(manager);
    });
  }

  reorder(ids: number[]) {
    return this.repo.manager.transaction(async (manager) => {
      const reviews = await this.findAllWithRelations(manager);

      const uniqueIds = new Set(ids);
      if (reviews.length !== uniqueIds.size) throw new BadRequestException('userReviews.invalidIds');

      const reviewById = new Map(reviews.map((review) => [review.id, review]));
      if (ids.some((id) => !reviewById.has(id))) throw new BadRequestException('userReviews.invalidIds');

      const ordered = ids.map((id) => reviewById.get(id)!);
      await this.reorderInternal(ordered, manager);

      return this.findAllWithRelations(manager);
    });
  }

  delete(position: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const result = await repo.delete({ position });
      if (!result.affected) throw new NotFoundException('userReviews.notFound');

      const remaining = await this.findAllWithRelations(manager);
      await this.reorderInternal(remaining, manager);

      return this.findAllWithRelations(manager);
    });
  }

  private async reorderInternal(reviews: UserReview[], manager: EntityManager) {
    const repo = manager.getRepository(UserReview);
    if (!reviews.length) return;

    await repo.save(reviews.map((review, i) => ({ ...review, position: -(i + 1) })));
    await repo.save(reviews.map((review, i) => ({ ...review, position: i + 1 })));
  }

  private async findAllWithRelations(manager?: EntityManager) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(UserReview);

      return repo.find({
        order: { position: 'ASC' },
        relations: { image: true },
      });
    });
  }
}
