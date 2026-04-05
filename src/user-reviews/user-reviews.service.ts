import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { MediaAttachment, UserReview } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { BadRequestException, NotFoundException } from 'src/common';

import { AddUserReviewDTO, UpdateUserReviewDTO } from './dto';

@Injectable()
export class UserReviewsService {
  constructor(
    @InjectRepository(UserReview)
    private readonly repo: Repository<UserReview>,
    private readonly attachmentService: MediaAttachmentService,
  ) {}

  async getAll() {
    const reviews = await this.repo.find({ order: { position: 'ASC' } });
    return this.attachMedia(reviews);
  }

  async add(dto: AddUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const count = await repo.count();
      if (count >= 3) throw new BadRequestException('userReviews.maxCount');

      const review = await repo.save(repo.create({ ...dto, position: count + 1 }));

      await this.attachmentService.sync(
        { entityId: review.id, entityType: 'user-review', mediaIds: [dto.imageId] },
        manager,
      );

      return this.findAllWithRelations(manager);
    });
  }

  async update(position: number, { imageId, ...dto }: UpdateUserReviewDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const review = await repo.findOne({ where: { position } });
      if (!review) throw new NotFoundException('userReviews.notFound');

      Object.assign(review, dto);
      await repo.save(review);

      if (imageId)
        await this.attachmentService.sync(
          { entityId: review.id, entityType: 'user-review', mediaIds: [imageId] },
          manager,
        );

      return this.findAllWithRelations(manager);
    });
  }

  async reorder(orderedIds: number[]) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const reviews = await repo.find({ order: { position: 'ASC' } });

      if (reviews.length !== orderedIds.length) throw new BadRequestException('userReviews.invalidIds');

      const uniqueIds = new Set(orderedIds);
      if (uniqueIds.size !== orderedIds.length) throw new BadRequestException('userReviews.invalidIds');

      const reviewById = new Map(reviews.map((review) => [review.id, review]));
      if (orderedIds.some((id) => !reviewById.has(id))) throw new BadRequestException('userReviews.invalidIds');

      const orderedReviews = orderedIds.map((id) => reviewById.get(id)!);
      await this.reorderInternal(orderedReviews, manager);

      return this.findAllWithRelations(manager);
    });
  }

  async delete(position: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(UserReview);

      const review = await repo.findOne({ where: { position } });
      if (!review) throw new NotFoundException('userReviews.notFound');

      await repo.remove(review);

      const remaining = await repo.find({ order: { position: 'ASC' } });
      await this.reorderInternal(remaining, manager);

      return this.findAllWithRelations(manager);
    });
  }

  private static readonly POSITION_OFFSET = 1000;
  private async reorderInternal(reviews: UserReview[], manager: EntityManager) {
    const repo = manager.getRepository(UserReview);
    if (!reviews.length) return;

    await repo.save(reviews.map((r) => ({ ...r, position: r.position + UserReviewsService.POSITION_OFFSET })));
    await repo.save(reviews.map((r, index) => ({ ...r, position: index + 1 })));
  }

  private async findAllWithRelations(manager: EntityManager) {
    const repo = manager.getRepository(UserReview);
    const attachmentRepo = manager.getRepository(MediaAttachment);

    const reviews = await repo.find({ order: { position: 'ASC' } });
    return this.attachMedia(reviews, attachmentRepo);
  }

  private async attachMedia(reviews: UserReview[], attachmentRepo?: Repository<MediaAttachment>) {
    if (!reviews.length) return [];

    const attachments = await this.attachmentService.getBulkMedia(
      reviews.map(({ id }) => id),
      'user-review',
      attachmentRepo,
    );

    return reviews.map((review) => ({
      ...review,
      image: attachments[review.id]?.[0] ?? null,
    }));
  }
}
