import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/services/media.service';
import { CacheService } from 'src/redis/cache.service';

import { AddBrandDTO } from './dtos/admin/add-brand.dto';
import { UpdateBrandDTO } from './dtos/admin/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
    private readonly mediaService: MediaService,
    private readonly cacheService: CacheService,
  ) {}

  private readonly CACHE_KEY = 'brands:all';
  private readonly getBrandCacheKey = (id: number) => `brands:${id}`;

  getAll() {
    return this.cacheService.getOrSet(
      this.CACHE_KEY,
      () => this.repo.find({ order: { id: 'ASC' }, relations: { image: true } }),
      { ttlMs: 1000 * 60 * 60 * 12 },
    );
  }

  getOne(id: number) {
    return this.cacheService.getOrSet(this.getBrandCacheKey(id), () => this.getOneOrFail(id), {
      ttlMs: 1000 * 60 * 60 * 12,
    });
  }

  add({ imageId, ...dto }: AddBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const image = await this.mediaService.attach(imageId, manager);
      const brand = await repo.save(repo.create({ ...dto, image }));

      await this.cacheService.delete(this.CACHE_KEY);
      await this.cacheService.delete(this.getBrandCacheKey(brand.id));

      return this.getOneOrFail(brand.id, manager);
    });
  }

  update(id: number, { imageId, ...dto }: UpdateBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await this.getOneOrFail(id, manager);

      Object.assign(brand, dto);

      if (imageId) brand.image = await this.mediaService.swapImage(imageId, brand.image?.id, manager);

      await repo.save(brand);

      await this.cacheService.delete(this.CACHE_KEY);
      await this.cacheService.delete(this.getBrandCacheKey(brand.id));

      return this.getOneOrFail(brand.id, manager);
    });
  }

  remove(id: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await this.getOneOrFail(id, manager, { products: true });
      if (brand.products.length) throw BadRequestException('products.brandHasProducts');

      if (brand.image) await this.mediaService.detach(brand.image.id, manager);

      await repo.delete(brand.id);

      await this.cacheService.delete(this.CACHE_KEY);
      await this.cacheService.delete(this.getBrandCacheKey(brand.id));

      return { deleted: true };
    });
  }

  private getOneOrFail(id: number, manager?: EntityManager, relations?: FindOptionsRelations<Brand>): Promise<Brand> {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await repo.findOne({ where: { id }, relations: { ...relations, image: true } });
      if (!brand) throw NotFoundException('products.brandNotFound');

      return brand;
    });
  }
}
