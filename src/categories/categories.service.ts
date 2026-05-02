import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { AddCategoryDTO } from './dtos/admin/add-category.dto';
import { UpdateCategoryDTO } from './dtos/admin/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  getAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  getOne(id: number) {
    return this.getOneOrFail(id);
  }

  async add(dto: AddCategoryDTO) {
    const category = await this.repo.save(this.repo.create(dto));

    return this.getOneOrFail(category.id);
  }

  async update(id: number, dto: UpdateCategoryDTO) {
    const result = await this.repo.update(id, dto);
    if (!result.affected) throw NotFoundException('products.categoryNotFound');

    return this.getOneOrFail(id);
  }

  async remove(id: number) {
    const category = await this.getOneOrFail(id, undefined, { products: true });
    if (category.products.length) throw BadRequestException('products.categoryHasProducts');

    await this.repo.delete(id);

    return { deleted: true };
  }

  private async getOneOrFail(id: number, manager?: EntityManager, relations?: FindOptionsRelations<Category>) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(Category);

      const category = await repo.findOne({ where: { id }, relations });
      if (!category) throw NotFoundException('products.categoryNotFound');

      return category;
    });
  }
}
