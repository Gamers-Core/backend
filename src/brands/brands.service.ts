import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { MediaService } from 'src/media/media.service';

import { AddBrandDTO } from './dtos/add-brand.dto';
import { UpdateBrandDTO } from './dtos/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
    private readonly mediaService: MediaService,
  ) {}

  getAll() {
    return this.repo.find({
      order: { id: 'ASC' },
      relations: { image: true },
    });
  }

  getOne(id: number) {
    return this.getBrandOrThrow(id);
  }

  add({ imageId, ...dto }: AddBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const image = await this.mediaService.attach(imageId, manager);
      const brand = await repo.save(repo.create({ ...dto, image }));

      return this.getBrandOrThrow(brand.id, manager);
    });
  }

  update(id: number, { imageId, ...dto }: UpdateBrandDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await this.getBrandOrThrow(id, manager);

      Object.assign(brand, dto);

      if (imageId) brand.image = await this.mediaService.swapImage(imageId, brand.image?.id, manager);

      await repo.save(brand);

      return this.getBrandOrThrow(brand.id, manager);
    });
  }

  delete(id: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await this.getBrandOrThrow(id, manager, { products: true });
      if (brand.products.length) throw new BadRequestException('products.brandHasProducts');

      if (brand.image) await this.mediaService.detach(brand.image.id, manager);

      await repo.delete(brand.id);

      return { deleted: true };
    });
  }

  private getBrandOrThrow(
    id: number,
    manager?: EntityManager,
    relations?: FindOptionsRelations<Brand>,
  ): Promise<Brand> {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(Brand);

      const brand = await repo.findOne({ where: { id }, relations: { ...relations, image: true } });
      if (!brand) throw new NotFoundException('products.brandNotFound');

      return brand;
    });
  }
}
