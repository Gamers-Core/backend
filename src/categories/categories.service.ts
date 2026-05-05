import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { CacheService } from 'src/redis/cache.service';

import { AddCategoryDTO } from './dtos/admin/add-category.dto';
import { UpdateCategoryDTO } from './dtos/admin/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    private readonly cacheService: CacheService,
  ) {}

  private readonly cacheKey = 'categories:all';
  private readonly getCategoryCacheKey = (id: number) => `categories:${id}`;

  getAll() {
    return this.cacheService.getOrSet(this.cacheKey, () => this.repo.find({ order: { id: 'ASC' } }), {
      ttlMs: 1000 * 60 * 60,
    });
  }

  getOne(id: number) {
    return this.cacheService.getOrSet(this.getCategoryCacheKey(id), () => this.getOneOrFail(id), {
      ttlMs: 1000 * 60 * 60,
    });
  }

  add(dto: AddCategoryDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Category);

      const category = await repo.save(repo.create(dto));

      await this.cacheService.delete(this.cacheKey);
      await this.cacheService.delete(this.getCategoryCacheKey(category.id));

      return this.getOneOrFail(category.id, manager);
    });
  }

  update(id: number, dto: UpdateCategoryDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Category);

      const result = await repo.update(id, dto);
      if (!result.affected) throw NotFoundException('products.categoryNotFound');

      await this.cacheService.delete(this.cacheKey);
      await this.cacheService.delete(this.getCategoryCacheKey(id));

      return this.getOneOrFail(id, manager);
    });
  }

  async remove(id: number) {
    await this.repo.manager.transaction(async (manager) => {
      const category = await this.getOneOrFail(id, manager, { products: true });
      if (category.products.length) throw BadRequestException('products.categoryHasProducts');

      await this.cacheService.delete(this.cacheKey);
      await this.cacheService.delete(this.getCategoryCacheKey(id));

      await manager.getRepository(Category).delete(id);
    });

    return { deleted: true };
  }

  private getOneOrFail(id: number, manager?: EntityManager, relations?: FindOptionsRelations<Category>) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(Category);

      const category = await repo.findOne({ where: { id }, relations });
      if (!category) throw NotFoundException('products.categoryNotFound');

      return category;
    });
  }
}
